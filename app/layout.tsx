import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

import "./globals.css";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://accessibility-dev-tools.dev"),
  title: {
    default: "Accessibility Dev Tools | IDE Tools for Blind Programmers",
    template: "%s | Accessibility Dev Tools"
  },
  description:
    "Development tools for blind programmers: screen-reader-first IDE workflows, audio code navigation, and tactile coding feedback in one professional toolkit.",
  keywords: [
    "blind programmers",
    "accessible IDE",
    "audio code navigation",
    "screen reader coding",
    "developer accessibility"
  ],
  openGraph: {
    title: "Accessibility Dev Tools",
    description:
      "A production toolkit that makes mainstream IDEs accessible to blind software engineers.",
    url: "https://accessibility-dev-tools.dev",
    siteName: "Accessibility Dev Tools",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Accessibility Dev Tools",
    description:
      "Screen-reader-first developer tools with audio navigation and tactile feedback support."
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${mono.variable} min-h-screen bg-[#0d1117] text-slate-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
