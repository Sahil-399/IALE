"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function RoadmapResult() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingToDashboard, setSavingToDashboard] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");
  const hasSaved = useRef(false);

  const saveToDashboard = async (roadmapData) => {
    // Prevent duplicate saves
    if (hasSaved.current) {
      console.log("⚠️ Already saved, skipping duplicate save");
      return;
    }

    setSavingToDashboard(true);
    setSaveStatus(null);

    try {
      const response = await fetch('/api/save-to-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kind: 'roadmap',
          topic: topic || 'Generated Roadmap',
          structured: roadmapData,
          raw: JSON.stringify(roadmapData, null, 2),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        hasSaved.current = true;
        setSaveStatus({ 
          type: 'success', 
          message: result.message,
          itemId: result.item.id
        });
      } else {
        setSaveStatus({ 
          type: 'error', 
          message: result.error || 'Failed to save to dashboard' 
        });
      }
    } catch (error) {
      console.error('Error saving to dashboard:', error);
      setSaveStatus({ 
        type: 'error', 
        message: 'Failed to save to dashboard' 
      });
    } finally {
      setSavingToDashboard(false);
    }
  };

  useEffect(() => {
    // Prevent multiple fetches in development
    if (hasSaved.current) return;
    
    const fetchRoadmap = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/generate_roadmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic }),
        });
        const data = await res.json();
        setRoadmap(data.structured);
        
        // Auto-save to dashboard if roadmap was successfully generated
        if (data.structured) {
          saveToDashboard(data.structured);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (topic) {
      fetchRoadmap();
    }
  }, [topic]); // Add topic as dependency

  // ------------------ Loading UI ------------------
  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-pulse">
            <span className="text-2xl text-white">⏳</span>
          </div>
          <h2 className="text-2xl font-bold text-purple-700 mb-2">
            Crafting Your Roadmap
          </h2>
          <p className="text-gray-600">
            Our AI is designing your personalized learning journey...
          </p>
        </div>
      </div>
    );

  // ------------------ Error UI ------------------
  if (!roadmap)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl text-red-600">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Roadmap Generation Failed
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't generate your roadmap. Please try again with a
            different topic.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  // ------------------ Main Roadmap UI ------------------
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-8 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative max-w-6xl mx-auto space-y-16 z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-purple-100">
            {/* Left Icon and Title */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg text-white">🎯</span>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
                  {roadmap.title}
                </h1>
                <p className="text-sm text-gray-500">
                  Personalized Learning Roadmap
                </p>
              </div>
            </div>

            {/* Save Status Feedback */}
            <div className="flex items-center gap-3">
              {savingToDashboard && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Saving to dashboard...</span>
                </div>
              )}
              
              {saveStatus && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  saveStatus.type === 'success' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {saveStatus.type === 'success' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">{saveStatus.message}</span>
                      {saveStatus.itemId && (
                        <a 
                          href="/dashboard" 
                          className="ml-2 text-xs underline hover:no-underline"
                        >
                          View Dashboard
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">{saveStatus.message}</span>
                    </>
                  )}
                </div>
              )}

              {!savingToDashboard && !saveStatus && (
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm flex items-center gap-2">
                  Save Roadmap ✅
                </button>
              )}
            </div>
          </div>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto mt-8 leading-relaxed">
            {roadmap.overview}
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-16">
          {roadmap.weeks?.map((week, index) => (
            <div key={week.week_number} className="relative pb-12">
              {/* Connector line */}
              {index < roadmap.weeks.length - 1 && (
                <div className="absolute left-16 top-20 w-0.5 h-full bg-gradient-to-b from-purple-300 to-indigo-300"></div>
              )}

              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-100 p-8 hover:shadow-2xl transition-all duration-300 group">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* Week Badge */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30 group-hover:scale-105 transition-transform duration-300">
                      <span className="text-white font-bold text-lg">
                        W{week.week_number}
                      </span>
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                      {week.focus_area}
                    </h2>

                    <div className="space-y-4">
                      {/* Goal */}
                      <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                        <h3 className="font-semibold text-purple-700 text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          Weekly Goal
                        </h3>
                        <p className="text-gray-700">{week.goal}</p>
                      </div>

                      {/* Topics */}
                      <div>
                        <h3 className="font-semibold text-purple-700 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          Key Topics
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {week.topics?.map((topic, topicIndex) => (
                            <span
                              key={topicIndex}
                              className="px-4 py-2 bg-white border border-purple-200 text-purple-700 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Resources */}
                      <div>
                        <h3 className="font-semibold text-purple-700 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          Learning Resources
                        </h3>
                        <ul className="space-y-2">
                          {week.resources?.map((resource, resourceIndex) => (
                            <li
                              key={resourceIndex}
                              className="flex items-start gap-3 text-gray-700 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                            >
                              <span className="text-purple-500 mt-1 flex-shrink-0">
                                📚
                              </span>
                              <span>{resource}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-purple-100 p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-purple-700 mb-3">
              Ready to Begin?
            </h3>
            <p className="text-gray-600 mb-6">
              Start your learning journey with Week 1 today!
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
              Start Learning 🚀
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
