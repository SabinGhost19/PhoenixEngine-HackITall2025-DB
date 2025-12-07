import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech",
});

export const metadata: Metadata = {
  title: "AGENTS ORCHESTRATOR // SYSTEM",
  description: "Legacy Transformation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${shareTechMono.variable} antialiased bg-black text-amber-500 overflow-x-hidden min-h-screen selection:bg-amber-500 selection:text-black`}>
        {/* CRT Effects Layer */}
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          {/* Scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
          {/* Flicker */}
          <div className="absolute inset-0 bg-white opacity-[0.02] animate-flicker pointer-events-none z-10"></div>
          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)] z-30 pointer-events-none"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-0 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
