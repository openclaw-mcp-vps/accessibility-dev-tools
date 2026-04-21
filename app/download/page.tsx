import type { Metadata } from "next";
import DownloadClient from "@/components/DownloadClient";

export const metadata: Metadata = {
  title: "Download Portal | Accessibility Dev Tools",
  description:
    "Unlock and download accessibility IDE packs after Stripe checkout. Includes extension bundles and onboarding scripts.",
};

interface DownloadPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DownloadPage({ searchParams }: DownloadPageProps) {
  const params = await searchParams;
  const rawSession = params.session_id;
  const initialSessionId = typeof rawSession === "string" ? rawSession : "";

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-white">Download & Access Portal</h1>
      <p className="mt-2 text-slate-300">
        Verify your Stripe purchase, unlock your account cookie, and download accessibility tooling packs.
      </p>
      <div className="mt-6">
        <DownloadClient initialSessionId={initialSessionId} />
      </div>
    </main>
  );
}
