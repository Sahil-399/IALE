 "use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleRoadmapClick = () => {
    if (isSignedIn) {
      router.push("/roadmap-quiz");
    } else {
      router.push("/sign-in");
    }
  };

  const handleCourseClick = () => {
    if (isSignedIn) {
      router.push("/quiz");
    } else {
      router.push("/sign-in");
    }
  };

  const handleAnalyticsClick = () => {
    if (isSignedIn) {
      router.push("/analytics");
    } else {
      router.push("/sign-in");
    }
  };

  const handleDashboardClick = () => {
    if (isSignedIn) {
      router.push("/dashboard");
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-20 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Branding */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent mb-6">
            SnowwEdu
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
            AI-powered learning analytics that tracks your progress and performance
          </p>
        </div>

        {/* Feature Chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {["Advanced Analytics", "Progress Tracking", "Activity Insights", "Learning Patterns"].map(
            (feature, index) => (
              <span
                key={feature}
                className="px-5 py-2.5 bg-white border border-purple-200 text-purple-700 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 hover:-translate-y-0.5"
              >
                {feature}
              </span>
            )
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button onClick={handleAnalyticsClick} className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
            View Analytics
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <button onClick={handleDashboardClick} className="group px-8 py-4 bg-white border border-purple-300 text-purple-700 font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 hover:border-purple-400">
            Dashboard
          </button>

          <button onClick={handleCourseClick} className="group px-8 py-4 bg-white border border-purple-300 text-purple-700 font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 hover:border-purple-400">
            Generate Course
          </button>

          <button onClick={handleRoadmapClick} className="group px-8 py-4 bg-white border border-purple-300 text-purple-700 font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 hover:border-purple-400">
            Generate Roadmap
          </button>
        </div>

        {/* Stats Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-purple-200 rounded-2xl px-8 py-8 shadow-lg max-w-2xl w-full mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { number: "Real-time", label: "Activity Tracking" },
              { number: "Visual", label: "Progress Charts" },
              { number: "Smart", label: "Learning Insights" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-purple-700 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-3 text-sm text-gray-500 font-medium">
          Transform your learning journey with AI-powered analytics
        </footer>
      </div>
    </main>
  );
}