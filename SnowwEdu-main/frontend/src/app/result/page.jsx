// src/app/result/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import ProgressTracker from "../../components/ProgressTracker";
import { courseOfflineStorage, syncManager, isOnline } from "../../lib/offline";

function QuizItem({ quizItem, index }) {
  // Handle both string and object quiz items
  if (typeof quizItem === 'string') {
    return <li>{quizItem}</li>;
  }

  // Handle object format
  if (typeof quizItem === 'object' && quizItem !== null) {
    return (
      <li className="mb-4">
        <div className="font-medium">{quizItem.question || "Question:"}</div>
        {quizItem.options && (
          <ul className="list-[upper-alpha] ml-6 mt-1 text-sm">
            {quizItem.options.map((option, optIndex) => (
              <li key={optIndex}>{option}</li>
            ))}
          </ul>
        )}
        {quizItem.hint && (
          <div className="text-sm text-gray-600 mt-1">💡 Hint: {quizItem.hint}</div>
        )}
        {quizItem.answer && (
          <div className="text-sm text-green-600 mt-1">✅ Answer: {quizItem.answer}</div>
        )}
      </li>
    );
  }

  // Fallback for unexpected formats
  return <li>Invalid quiz format</li>;
}

function ModuleCard({ mod, idx, savedItemId }) {
  const [open, setOpen] = useState(true);
  const [lessonProgress, setLessonProgress] = useState({});

  useEffect(() => {
    if (savedItemId) {
      const savedProgress = localStorage.getItem(`lesson-progress-${savedItemId}`);
      if (savedProgress) {
        setLessonProgress(JSON.parse(savedProgress));
      }
    }
  }, [savedItemId]);

  const handleLessonProgress = (lessonId, progress) => {
    setLessonProgress((prevProgress) => ({ ...prevProgress, [lessonId]: progress }));
    if (savedItemId) {
      localStorage.setItem(`lesson-progress-${savedItemId}`, JSON.stringify({ ...prevProgress, [lessonId]: progress }));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {idx + 1}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {mod.module_title}
              </h3>
              {mod.duration && (
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {mod.duration}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
          >
            {open ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Collapse
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Expand
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {open && (
        <div className="p-6 space-y-6">
          {/* Lessons */}
          {mod.lessons && mod.lessons.length > 0 && (
            <div>
              <h4 className="font-semibold text-lg text-gray-900 mb-4">Lessons</h4>
              <div className="space-y-4">
                {mod.lessons.map((lesson, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-semibold text-gray-900 flex-1">{lesson.title}</h5>
                      {savedItemId && (
                        <ProgressTracker
                          savedItemId={savedItemId}
                          lessonIndex={i}
                          moduleIndex={idx}
                          initialCompleted={lessonProgress[`${idx}-${i}`] || false}
                        />
                      )}
                    </div>

                    {lesson.explanation && (
                      <p className="text-gray-700 leading-relaxed">
                        {lesson.explanation}
                      </p>
                    )}

                    {/* Code Examples */}
                    {lesson.code_examples && lesson.code_examples.length > 0 && (
                      <div className="mt-4">
                        <h6 className="font-semibold text-sm text-gray-900 mb-2">Code Examples</h6>
                        <div className="space-y-2">
                          {lesson.code_examples.map((code, ci) => (
                            <pre
                              key={ci}
                              className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono"
                            >
                              <code>{code}</code>
                            </pre>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exercises */}
                    {lesson.exercises && lesson.exercises.length > 0 && (
                      <div className="mt-4">
                        <h6 className="font-semibold text-sm text-gray-900 mb-2">Exercises</h6>
                        <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
                          {lesson.exercises.map((ex, ei) => (
                            <li key={ei}>{ex}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Quiz */}
                    {lesson.quiz && lesson.quiz.length > 0 && (
                      <div className="mt-4">
                        <h6 className="font-semibold text-sm text-gray-900 mb-2">Quiz</h6>
                        <ul className="list-decimal ml-6 text-sm text-gray-700 space-y-3">
                          {lesson.quiz.map((q, qi) => (
                            <QuizItem key={qi} quizItem={q} index={qi} />
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mini Project */}
          {mod.mini_project && (
            <div className="border-t pt-6">
              <h4 className="font-semibold text-lg text-gray-900 mb-3">Mini Project</h4>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h5 className="font-medium text-indigo-900 mb-2">{mod.mini_project.title}</h5>
                <p className="text-gray-700 mb-3">{mod.mini_project.description}</p>
                {mod.mini_project.steps && mod.mini_project.steps.length > 0 && (
                  <div>
                    <h6 className="font-medium text-gray-900 mb-2">Steps:</h6>
                    <ol className="list-decimal ml-6 text-sm text-gray-700 space-y-1">
                      {mod.mini_project.steps.map((s, si) => (
                        <li key={si}>{s}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resources */}
          {mod.resources && mod.resources.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="font-semibold text-lg text-gray-900 mb-3">Resources</h4>
              <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
                {mod.resources.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResultPage() {
  const [loading, setLoading] = useState(true);
  const [structured, setStructured] = useState(null);
  const [raw, setRaw] = useState("");
  const [savingToDashboard, setSavingToDashboard] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const searchParams = useSearchParams();
  const savedItemId = searchParams.get('id');

  // Sync progress when coming back online
  useEffect(() => {
    const handleOnline = async () => {
      if (syncManager.hasPendingSync()) {
        setSyncStatus('Syncing your progress...');
        try {
          const results = await syncManager.syncProgress();
          const successful = results.filter(r => r.success).length;
          const failed = results.filter(r => !r.success).length;
          
          if (successful > 0) {
            setSyncStatus(`Synced ${successful} items successfully${failed > 0 ? ` (${failed} failed)` : ''}`);
            setTimeout(() => setSyncStatus(null), 3000);
          }
        } catch (error) {
          setSyncStatus('Sync failed. Please try again.');
          setTimeout(() => setSyncStatus(null), 3000);
        }
      }
    };

    const handleOffline = () => {
      setIsOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOfflineMode(!isOnline());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveToDashboard = async (kind, topic, structuredData, rawText) => {
    setSavingToDashboard(true);
    setSaveStatus(null);

    try {
      console.log("🔍 Frontend: Starting save to dashboard...");
      
      const response = await fetch('/api/save-to-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kind,
          topic,
          structured: structuredData,
          raw: rawText,
        }),
      });

      console.log("🔍 Frontend: Response status:", response.status);
      
      const result = await response.json();
      console.log("🔍 Frontend: Response data:", result);

      if (response.ok) {
        // Save course data for offline access
        if (result.item && result.item.id) {
          courseOfflineStorage.saveCourse(result.item.id, {
            structured: structuredData,
            raw: rawText,
            topic: topic,
            kind: kind
          });
        }
        
        setSaveStatus({ 
          type: 'success', 
          message: result.message,
          itemId: result.item.id
        });
        console.log("✅ Frontend: Save successful!");
      } else {
        setSaveStatus({ 
          type: 'error', 
          message: result.error || 'Failed to save to dashboard',
          details: result.details || null
        });
        console.log("❌ Frontend: Save failed:", result);
      }
    } catch (error) {
      console.error('❌ Frontend: Network error:', error);
      setSaveStatus({ 
        type: 'error', 
        message: 'Failed to save to dashboard',
        details: error.message 
      });
    } finally {
      setSavingToDashboard(false);
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      
      // If we have a savedItemId, try to load from offline storage first
      if (savedItemId) {
        // Try offline storage first
        const offlineCourse = courseOfflineStorage.getCourse(savedItemId);
        if (offlineCourse) {
          console.log("✅ Loading course from offline storage:", offlineCourse.topic);
          setStructured(offlineCourse.structured);
          setRaw(offlineCourse.raw || "");
          setLoading(false);
          
          // Show offline indicator
          if (!isOnline()) {
            setSaveStatus({
              type: 'info',
              message: 'Viewing course offline. Progress will sync when online.'
            });
          }
          
          // Try to sync with server if online
          if (isOnline()) {
            try {
              console.log("🔍 Attempting to sync with server...");
              const response = await fetch(`/api/get-saved-item?id=${savedItemId}`);
              
              if (response.ok) {
                const result = await response.json();
                console.log("✅ Successfully synced with server:", result.item.topic);
                
                // Update offline storage with latest data
                courseOfflineStorage.saveCourse(savedItemId, {
                  structured: result.item.structured,
                  raw: result.item.raw || "",
                  topic: result.item.topic,
                  kind: result.item.kind
                });
                
                setStructured(result.item.structured);
                setRaw(result.item.raw || "");
              }
            } catch (error) {
              console.log("⚠️ Server sync failed, using offline data:", error);
            }
          }
          return;
        }
        
        // Try to load from server if not in offline storage
        try {
          console.log("🔍 Loading saved course data from server for ID:", savedItemId);
          const response = await fetch(`/api/get-saved-item?id=${savedItemId}`);
          
          if (response.ok) {
            const result = await response.json();
            console.log("✅ Successfully loaded saved course:", result.item.topic);
            
            // Save to offline storage for future use
            courseOfflineStorage.saveCourse(savedItemId, {
              structured: result.item.structured,
              raw: result.item.raw || "",
              topic: result.item.topic,
              kind: result.item.kind
            });
            
            setStructured(result.item.structured);
            setRaw(result.item.raw || "");
            setLoading(false);
            return;
          } else {
            console.error("❌ Failed to load saved course:", await response.text());
            setRaw("Error loading saved course: " + (await response.text()));
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("❌ Error loading saved course:", error);
          setRaw("Error loading saved course: " + String(error));
          setLoading(false);
          return;
        }
      }
      
      // If no savedItemId, generate new course (original logic)
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const payload = {
        topic: userInfo.topic || "",
        user_info: userInfo,
      };

      try {
        const res = await fetch("http://127.0.0.1:8000/generate_course", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`API request failed with status ${res.status}`);
        }

        const data = await res.json();
        console.log("✅ Course generated successfully:", data);

        if (data.structured) {
          setStructured(data.structured);
          setRaw(JSON.stringify(data, null, 2));
          
          // Auto-save to dashboard if course was successfully generated
          saveToDashboard("course", userInfo.topic || "Generated Course", data.structured, JSON.stringify(data, null, 2));
        } else {
          setRaw("Error: No structured data received from API");
        }
      } catch (err) {
        console.error("❌ Error generating course:", err);
        setRaw("Error generating course. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [savedItemId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your personalized course...</p>
        </div>
      </div>
    );
  }

  if (structured) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {structured.course_title || "Generated Course"}
                </h1>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  {structured.overview}
                </p>
                {structured.total_duration || structured.recommended_duration ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Recommended duration: {structured.total_duration || structured.recommended_duration}</span>
                  </div>
                ) : null}
              </div>

              {/* Save Status Feedback */}
              <div className="ml-4">
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
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{saveStatus.message}</span>
                          {saveStatus.details && (
                            <span className="text-xs text-red-600 mt-1">Details: {saveStatus.details}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modules */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              Course Modules
            </h2>
            {structured?.modules?.length > 0 ? (
              structured.modules.map((mod, i) => (
                <ModuleCard key={i} mod={mod} idx={i} savedItemId={savedItemId} />
              ))
            ) : (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                <p className="text-gray-500">No modules available.</p>
              </div>
            )}
          </section>

          {/* Capstone Project */}
          {structured.capstone && (
            <section className="mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Capstone Project: {structured.capstone.title || "Final Project"}
                </h3>
                <p className="text-purple-100 text-lg mb-6">{structured.capstone.description}</p>
                
                {structured.capstone.requirements && structured.capstone.requirements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Requirements</h4>
                    <ul className="list-disc ml-6 text-purple-100 space-y-1">
                      {structured.capstone.requirements.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
                
                {structured.capstone.steps && structured.capstone.steps.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Implementation Steps</h4>
                    <ul className="list-disc ml-6 text-purple-100 space-y-1">
                      {structured.capstone.steps.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Final Project - Alternative name */}
          {structured.final_project && !structured.capstone && (
            <section className="mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Final Project: {structured.final_project.title || "Final Project"}
                </h3>
                <p className="text-blue-100 text-lg">{structured.final_project.description}</p>
              </div>
            </section>
          )}

          {/* Tips */}
          {structured.tips && structured.tips.length > 0 && (
            <section className="bg-white rounded-2xl p-8 border border-gray-200">
              <h4 className="font-semibold text-xl text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Learning Tips
              </h4>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                {structured.tips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </section>
          )}
        </div>
      </main>
    );
  }

  // Fallback: render raw (likely markdown)
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Generated Course Content</h2>
          <div className="prose max-w-none">
            <ReactMarkdown>{raw}</ReactMarkdown>
          </div>
        </div>
      </div>
    </main>
  );
}