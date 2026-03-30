"use client";
import { useEffect, useState } from "react";

export default function RoadmapPage() {
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [raw, setRaw] = useState("");

  useEffect(() => {
    const fetchRoadmap = async () => {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const payload = { topic: userInfo.topic || "" };

      try {
        const res = await fetch("http://127.0.0.1:8000/generate_roadmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        setRoadmap(data.structured || null);
        setRaw(data.raw || "");
      } catch (err) {
        setRaw("Error generating roadmap: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your roadmap...</p>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Generated (raw)</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
            {raw}
          </pre>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-3xl font-bold mb-4 text-indigo-700">
          {roadmap.title}
        </h1>
        <p className="text-gray-700 mb-8">{roadmap.overview}</p>

        <div className="space-y-8">
          {roadmap.weeks?.map((week, i) => (
            <div
              key={i}
              className="border-l-4 border-indigo-500 pl-6 py-4 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold text-indigo-700 mb-2">
                Week {week.week_number}: {week.focus_area}
              </h2>

              {week.topics && (
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-800">Topics:</h3>
                  <ul className="list-disc ml-6 text-sm text-gray-700">
                    {week.topics.map((t, j) => <li key={j}>{t}</li>)}
                  </ul>
                </div>
              )}

              {week.resources && (
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-800">Resources:</h3>
                  <ul className="list-disc ml-6 text-sm text-gray-700">
                    {week.resources.map((r, j) => <li key={j}>{r}</li>)}
                  </ul>
                </div>
              )}

              {week.goal && (
                <p className="text-sm text-gray-600">
                  🎯 <strong>Goal:</strong> {week.goal}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
