import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk, Geist } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "700"]
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  metadataBase: new URL("https://accessibility-dev-tools.com"),
  title: {
    default: "Accessibility Dev Tools | Development Tools for Blind Programmers",
    template: "%s | Accessibility Dev Tools"
  },
  description:
    "Accessible IDE extension packs, audio code navigation, and tactile feedback tooling for blind programmers who need professional development workflows.",
  keywords: [
    "blind programmers",
    "accessible IDE",
    "screen reader coding",
    "audio code navigation",
    "tactile developer tools"
  ],
  openGraph: {
    title: "Accessibility Dev Tools",
    description:
      "Development tools for blind programmers with better screen reader integration, audio navigation, and tactile feedback.",
    type: "website",
    url: "https://accessibility-dev-tools.com",
    siteName: "Accessibility Dev Tools"
  },
  twitter: {
    card: "summary_large_image",
    title: "Accessibility Dev Tools",
    description:
      "Production-grade accessibility tooling for blind software engineers using modern IDEs."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" className={cn(displayFont.variable, monoFont.variable, "font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
