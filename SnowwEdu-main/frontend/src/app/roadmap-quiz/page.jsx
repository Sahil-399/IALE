"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RoadmapQuiz() {
  const [topic, setTopic] = useState("");
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return alert("Please enter a topic!");
    router.push(`/roadmap-result?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-20 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span className="text-2xl text-white">🗺️</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent mb-3">
              Roadmap Generator
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Enter any skill or topic you want to master, and our AI will create your personalized learning journey.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-3xl shadow-2xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">
                  What do you want to learn?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Full Stack Web Development, Data Science, Digital Marketing..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-300 placeholder-gray-400 text-base"
                    suppressHydrationWarning
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!topic.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg transition-all duration-300 group"
              >
                <span className="flex items-center justify-center gap-2 text-base">
                  Generate My Roadmap
                  <span className="group-hover:scale-110 transition-transform">✨</span>
                </span>
              </button>
            </form>
          </div>

          {/* Examples */}
          {isClient && (
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500 mb-3">Try: Machine Learning, UX Design, Python Programming</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {["Web Dev", "Data Science", "AI", "Marketing"].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setTopic(example)}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
