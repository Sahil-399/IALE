import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";

import { db } from "../../db";
import { savedItems } from "../../db/schema";

export default async function DashboardPage() {
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
      .limit(20);
  } catch (error) {
    loadError = "Could not load saved learning history yet.";
  }

  const total = items.length;
  const courses = items.filter((i) => i.kind === "course").length;
  const roadmaps = items.filter((i) => i.kind === "roadmap").length;
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekActivity = items.filter((i) => i.createdAt && new Date(i.createdAt) >= last7Days).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-indigo-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-3xl shadow-xl p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-700 mt-2">
                Welcome{user?.firstName ? `, ${user.firstName}` : ""}. Your learning progress at a glance.
              </p>
            </div>
            <Link
              href="/analytics"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-sm font-medium rounded-xl hover:from-purple-700 hover:to-indigo-800 transition"
            >
              View Analytics
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
              <div className="text-xs uppercase text-purple-700 font-semibold">Total Saved</div>
              <div className="text-3xl font-bold text-purple-900 mt-1">{total}</div>
              {total > 0 && (
                <div className="mt-2 text-xs text-purple-600">Keep learning!</div>
              )}
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
              <div className="text-xs uppercase text-indigo-700 font-semibold">Courses</div>
              <div className="text-3xl font-bold text-indigo-900 mt-1">{courses}</div>
              {courses > 0 && (
                <div className="mt-2 text-xs text-indigo-600">{Math.round((courses / total) * 100)}% of content</div>
              )}
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
              <div className="text-xs uppercase text-cyan-700 font-semibold">Roadmaps</div>
              <div className="text-3xl font-bold text-cyan-900 mt-1">{roadmaps}</div>
              {roadmaps > 0 && (
                <div className="mt-2 text-xs text-cyan-600">{Math.round((roadmaps / total) * 100)}% of content</div>
              )}
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="text-xs uppercase text-emerald-700 font-semibold">Last 7 Days</div>
              <div className="text-3xl font-bold text-emerald-900 mt-1">{weekActivity}</div>
              {weekActivity > 0 && (
                <div className="mt-2 text-xs text-emerald-600">Active learner!</div>
              )}
            </div>
          </div>

          {loadError ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
              {loadError}
            </div>
          ) : null}

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Recent Learning Activity</h2>
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-gray-600">
                No saved items yet. Generate your first roadmap or course to start tracking progress.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-gray-200 bg-white p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold text-gray-900">{item.topic}</div>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            item.kind === "course"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {item.kind}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {item.kind === "course" ? "Course" : "Roadmap"}{" "}
                        {item.createdAt ? `• ${new Date(item.createdAt).toLocaleString()}` : ""}
                      </div>

                      {/* Progress tracking for courses */}
                      {item.kind === "course" && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{item.progressPercentage || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${item.progressPercentage || 0}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{item.completedLessons || 0} of {item.totalLessons || 0} lessons</span>
                            {item.isCompleted && (
                              <span className="text-green-600 font-semibold">✓ Completed</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.kind === "course" && (
                        <Link
                          href={`/result?id=${item.id}`}
                          className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition"
                        >
                          Continue
                        </Link>
                      )}
                      {item.kind === "roadmap" && (
                        <Link
                          href={`/roadmap-result?id=${item.id}`}
                          className="px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-sm font-semibold hover:bg-purple-100 transition"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/roadmap-quiz"
              className="rounded-2xl border border-purple-100 bg-purple-50 hover:bg-purple-100 transition p-6"
            >
              <div className="font-semibold text-purple-800">Generate a roadmap</div>
              <div className="text-sm text-gray-700 mt-1">Create a week-by-week plan and save it.</div>
            </Link>
            <Link
              href="/quiz"
              className="rounded-2xl border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 transition p-6"
            >
              <div className="font-semibold text-indigo-800">Generate a course</div>
              <div className="text-sm text-gray-700 mt-1">Build a full module-based course and save it.</div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

