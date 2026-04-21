import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AccessibilityDemo } from "@/components/AccessibilityDemo";
import { AudioCodePlayer } from "@/components/AudioCodePlayer";
import { IDEExtensionCard } from "@/components/IDEExtensionCard";
import { LogoutButton } from "@/components/LogoutButton";
import { ACCESS_COOKIE_NAME, getEmailFromAccessToken } from "@/lib/auth";
import { extensionCatalog } from "@/lib/downloads";

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const email = await getEmailFromAccessToken(token);

  if (!email) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-14 pt-8 sm:px-6 lg:px-8">
      <section className="section-shell p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mono text-xs uppercase tracking-[0.16em] text-[var(--accent-2)]">Paid Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold">Accessible Development Workspace</h1>
            <p className="mt-2 text-sm text-[var(--text-soft)]">
              Signed in as <span className="font-medium text-[var(--text)]">{email}</span>
            </p>
          </div>
          <LogoutButton />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {extensionCatalog.map((extension) => (
          <IDEExtensionCard key={extension.id} extension={extension} />
        ))}
      </section>

      <AudioCodePlayer />
      <AccessibilityDemo />
    </main>
  );
}
