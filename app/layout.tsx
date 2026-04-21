import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap"
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  metadataBase: new URL("https://accessibility-dev-tools.example"),
  title: {
    default: "Accessibility Dev Tools",
    template: "%s | Accessibility Dev Tools"
  },
  description:
    "Screen reader-optimized developer tools for blind programmers: accessible code editing, audio guidance, and keyboard-first diagnostics.",
  openGraph: {
    title: "Accessibility Dev Tools",
    description:
      "Build and review code with audio feedback, semantic navigation, and automated accessibility diagnostics tuned for blind developers.",
    url: "https://accessibility-dev-tools.example",
    siteName: "Accessibility Dev Tools",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Accessibility Dev Tools",
    description:
      "A practical toolkit for blind programmers: keyboard-native editor controls, spoken cues, and accessibility regression checks."
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
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${plexMono.variable} bg-[#0d1117] text-[var(--foreground)] antialiased`}>
        {children}
      </body>
    </html>
  );
}
