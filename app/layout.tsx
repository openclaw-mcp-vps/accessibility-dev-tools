import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://accessibility-dev-tools.com"),
  title: "Accessibility Dev Tools | IDE Accessibility for Blind Programmers",
  description:
    "Development tools for blind programmers: screen-reader-first IDE workflows, audio code navigation, tactile feedback cues, and downloadable extension packs.",
  keywords: [
    "blind programmers",
    "accessible IDE",
    "screen reader coding",
    "audio code navigation",
    "tactile programming tools",
  ],
  openGraph: {
    title: "Accessibility Dev Tools",
    description:
      "Professional development tools that make mainstream IDEs and code editors fully accessible to blind software engineers.",
    url: "https://accessibility-dev-tools.com",
    siteName: "Accessibility Dev Tools",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Accessibility Dev Tools platform preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Accessibility Dev Tools",
    description:
      "Accessible coding tools for blind programmers with screen-reader-first workflows.",
    images: ["/og-image.svg"],
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
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
