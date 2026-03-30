import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";

import { db } from "../../db";
import { savedItems } from "../../db/schema";

function clampNumber(value, min, max) {
  if (typeof value !== "number" || Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export default async function AnalyticsPage() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const user = await currentUser();

  let items = [];
  let loadError = "";

  try {
    items = await db
      .select()
      .from(savedItems)
      .where(eq(savedItems.clerkUserId, userId))
      .orderBy(desc(savedItems.createdAt))
      .limit(250);
  } catch (error) {
    loadError = "Could not load analytics yet.";
  }

  const total = items.length;
  const courseItems = items.filter((i) => i.kind === "course");
  const roadmapItems = items.filter((i) => i.kind === "roadmap");
  const courseCount = courseItems.length;
  const roadmapCount = roadmapItems.length;
  const completed = items.filter((i) => i.isCompleted);
  const completedCount = completed.length;

  const completionRate = total ? Math.round((completedCount / total) * 100) : 0;

  const avgCourseProgress = courseCount
    ? Math.round(
        courseItems.reduce(
          (sum, i) => sum + clampNumber(i.progressPercentage ?? 0, 0, 100),
          0,
        ) / courseCount,
      )
    : 0;

  const avgCourseCompletionRate = courseCount
    ? Math.round(
        (courseItems.filter((i) => i.isCompleted).length / courseCount) * 100,
      )
    : 0;

  const lastSavedAt =
    items[0]?.createdAt ? new Date(items[0].createdAt).toLocaleString() : "—";

  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activity7 = items.filter((i) => i.createdAt && new Date(i.createdAt) >= last7Days).length;

  const progressBuckets = [
    { label: "0-25%", from: 0, to: 25 },
    { label: "26-50%", from: 26, to: 50 },
    { label: "51-75%", from: 51, to: 75 },
    { label: "76-100%", from: 76, to: 100 },
  ];

  const progressBucketCounts = progressBuckets.map((b) => {
    const count = courseItems.filter((i) => {
      const p = clampNumber(i.progressPercentage ?? 0, 0, 100);
      return p >= b.from && p <= b.to;
    }).length;
    return { ...b, count };
  });

  const maxBucketCount = Math.max(1, ...progressBucketCounts.map((b) => b.count));

  const topTopics = Array.from(
    items
      .reduce((map, i) => {
        const key = (i.topic || "").trim();
        if (!key) return map;
        map.set(key, (map.get(key) || 0) + 1);
        return map;
      }, new Map())
      .entries(),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const dayKeys = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - idx));
    return d.toDateString();
  });

  const activityByDayMap = new Map(dayKeys.map((k) => [k, 0]));
  for (const i of items) {
    if (!i.createdAt) continue;
    const dKey = new Date(i.createdAt).toDateString();
    if (activityByDayMap.has(dKey)) {
      activityByDayMap.set(dKey, activityByDayMap.get(dKey) + 1);
    }
  }
  const activityByDay = dayKeys.map((k) => ({ key: k, count: activityByDayMap.get(k) || 0 }));
  const maxActivityPerDay = Math.max(1, ...activityByDay.map((d) => d.count));

  const recentItems = items.slice(0, 10);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-indigo-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-3xl shadow-xl p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="max-w-xl">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
                Analytics
              </h1>
              <p className="text-gray-700 mt-2">
                {user?.firstName ? `${user.firstName}, ` : ""}
                track completion, progress, and activity trends across your saved learning.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Last saved: {lastSavedAt}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-sm font-medium rounded-xl hover:from-purple-700 hover:to-indigo-800 transition"
              >
                Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="text-xs uppercase text-emerald-700 font-semibold">Completion rate</div>
              <div className="text-3xl font-bold text-emerald-900 mt-1">{completionRate}%</div>
              <div className="mt-2 text-xs text-emerald-600">
                {completedCount} of {total} completed
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
              <div className="text-xs uppercase text-indigo-700 font-semibold">Avg course progress</div>
              <div className="text-3xl font-bold text-indigo-900 mt-1">{avgCourseProgress}%</div>
              <div className="mt-2 text-xs text-indigo-600">
                Completion (courses): {avgCourseCompletionRate}%
              </div>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
              <div className="text-xs uppercase text-purple-700 font-semibold">Activity (7 days)</div>
              <div className="text-3xl font-bold text-purple-900 mt-1">{activity7}</div>
              <div className="mt-2 text-xs text-purple-600">
                Courses: {courseCount} • Roadmaps: {roadmapCount}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <div className="text-xs uppercase text-amber-700 font-semibold">Saved topics</div>
              <div className="text-3xl font-bold text-amber-900 mt-1">{topTopics.length ? topTopics.length : 0}</div>
              <div className="mt-2 text-xs text-amber-600">
                Top topic drives most sessions
              </div>
            </div>
          </div>

          {loadError ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
              {loadError}
            </div>
          ) : null}

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-bold text-gray-900">Progress distribution</h2>
              <p className="text-sm text-gray-600 mt-1">
                How your saved courses are progressing, grouped by percentage.
              </p>

              <div className="mt-5 space-y-3">
                {progressBucketCounts.map((b) => {
                  const pct = Math.round((b.count / maxBucketCount) * 100);
                  return (
                    <div key={b.label} className="flex items-center gap-4">
                      <div className="w-20 text-sm text-gray-800 font-semibold">{b.label}</div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-14 text-right text-sm text-gray-600 shrink-0">{b.count}</div>
                    </div>
                  );
                })}
              </div>

              {courseCount === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-gray-600 text-sm">
                  No courses saved yet. Generate a course to start tracking progress.
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-bold text-gray-900">Activity by day</h2>
              <p className="text-sm text-gray-600 mt-1">
                Items saved over the last 7 days.
              </p>

              <div className="mt-5 flex items-end gap-2">
                {activityByDay.map((d) => {
                  const hPct = Math.round((d.count / maxActivityPerDay) * 100);
                  return (
                    <div key={d.key} className="flex flex-col items-center gap-2 flex-1">
                      <div
                        className="w-full rounded-xl bg-gradient-to-b from-purple-200 to-indigo-300 transition"
                        style={{ height: `${Math.max(8, hPct)}px` }}
                        title={`${d.key}: ${d.count}`}
                      />
                      <div className="text-[11px] text-gray-600">
                        {new Date(d.key).toLocaleDateString(undefined, { weekday: "short" })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {total === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-gray-600 text-sm">
                  No analytics yet—save your first roadmap or course.
                </div>
              ) : null}
            </section>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Recent activity</h2>
                  <p className="text-sm text-gray-600 mt-1">Latest saved items (compact view).</p>
                </div>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-purple-700 hover:underline"
                >
                  View full dashboard
                </Link>
              </div>

              {recentItems.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-gray-600 text-sm">
                  No saved items yet. Generate your first roadmap or course to start tracking progress.
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 pr-3 font-semibold">Type</th>
                        <th className="py-2 pr-3 font-semibold">Topic</th>
                        <th className="py-2 pr-3 font-semibold">Date</th>
                        <th className="py-2 font-semibold">Progress</th>
                        <th className="py-2 pl-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentItems.map((item) => (
                        <tr key={item.id} className="border-t border-gray-100">
                          <td className="py-3 pr-3">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                item.kind === "course"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {item.kind}
                            </span>
                          </td>
                          <td className="py-3 pr-3">
                            <div className="font-semibold text-gray-900 truncate max-w-[260px]">
                              {item.topic}
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-gray-600 whitespace-nowrap">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}
                          </td>
                          <td className="py-3">
                            {item.kind === "course" ? (
                              <div className="flex items-center gap-3">
                                <div className="w-10 text-right font-semibold text-gray-800">
                                  {item.progressPercentage ?? 0}%
                                </div>
                                <div className="w-24 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className="h-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                                    style={{ width: `${clampNumber(item.progressPercentage ?? 0, 0, 100)}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-700 font-semibold">
                                {item.isCompleted ? "Completed" : "In progress"}
                              </div>
                            )}
                          </td>
                          <td className="py-3 pl-3 whitespace-nowrap">
                            {item.kind === "course" ? (
                              <Link
                                href={`/result?id=${item.id}`}
                                className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition"
                              >
                                Continue
                              </Link>
                            ) : (
                              <Link
                                href={`/roadmap-result?id=${item.id}`}
                                className="px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition"
                              >
                                View
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-1">
              <h2 className="text-lg font-bold text-gray-900">Top topics</h2>
              <p className="text-sm text-gray-600 mt-1">What you revisit most.</p>

              {topTopics.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-gray-600 text-sm">
                  No topics yet—generate a roadmap or course to start building your history.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {topTopics.map(([topic, count]) => {
                    const pct = total ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={topic} className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <div className="font-semibold text-gray-900 truncate">{topic}</div>
                          <div className="text-sm text-gray-600 shrink-0">
                            {count} ({pct}%)
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

