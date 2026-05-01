import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BlunderLab — Turn every blunder into your next training plan",
    template: "%s · BlunderLab",
  },
  description:
    "BlunderLab is an AI chess coach that explains your mistakes, detects recurring patterns, and gives you one clear goal for the next match.",
  metadataBase: new URL("https://blunderlab.app"),
  openGraph: {
    title: "BlunderLab",
    description:
      "AI chess coach that turns every blunder into a personal training plan.",
    url: "https://blunderlab.app",
    siteName: "BlunderLab",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-bg text-fg antialiased">{children}</body>
    </html>
  );
}
