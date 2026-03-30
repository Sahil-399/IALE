import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "../components/Navbar";
import OfflineStatus from "../components/OfflineStatus";
import { registerServiceWorker } from "../lib/offline";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SnowwEdu",
  description: "AI-powered learning roadmaps and personalized courses",
};

export default function RootLayout({ children }) {
  // Register service worker for offline support
  if (typeof window !== 'undefined') {
    registerServiceWorker();
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInForceRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/dashboard"
          signInFallbackRedirectUrl="/sign-in"
          signUpFallbackRedirectUrl="/sign-up"
          // Hide development-key warning noise in local dev.
          unsafe_disableDevelopmentModeConsoleWarning
        >
          <Navbar />
          <OfflineStatus />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
