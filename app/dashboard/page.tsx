import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ScreenReaderOptimized from "@/components/ScreenReaderOptimized";
import { hasPaidAccess } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard | Accessibility Dev Tools",
  description:
    "Use audio code navigation, tactile feedback cues, and screen-reader-optimized code landmarks in the protected dashboard.",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();

  if (!hasPaidAccess(cookieStore)) {
    redirect("/download");
  }

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="surface rounded-xl p-6">
        <h1 className="text-3xl font-semibold text-white">Accessibility Workbench Dashboard</h1>
        <p className="mt-2 text-slate-300">
          This protected dashboard helps blind developers inspect source files by semantic landmarks, tune spoken output,
          and navigate with audio and tactile cues.
        </p>
      </header>

      <section className="mt-6">
        <ScreenReaderOptimized />
      </section>
    </main>
  );
}
