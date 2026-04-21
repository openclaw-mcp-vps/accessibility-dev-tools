import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "@/app/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://accessibility-dev-tools.com"),
  title: "Accessibility Dev Tools | Development tools for blind programmers",
  description:
    "Download IDE accessibility plugins, unlock audio code navigation, and configure screen-reader-first coding workflows built for blind developers.",
  keywords: [
    "blind programmer tools",
    "accessible IDE",
    "screen reader coding",
    "audio code navigation",
    "developer accessibility",
  ],
  openGraph: {
    title: "Accessibility Dev Tools",
    description:
      "Professional accessibility tooling for blind software engineers, students, and consultants.",
    url: "https://accessibility-dev-tools.com",
    siteName: "Accessibility Dev Tools",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Accessibility Dev Tools",
    description:
      "Enhanced screen reader integration, audio navigation, and tactile feedback support for mainstream editors.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
      <body className="text-slate-50 antialiased">
        <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0d1117]/95 backdrop-blur">
          <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="text-sm font-semibold tracking-wide text-slate-100">
              accessibility-dev-tools
            </Link>
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <Link className="hover:text-white" href="/dashboard">
                Dashboard
              </Link>
              <Link className="hover:text-white" href="/downloads">
                Downloads
              </Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
