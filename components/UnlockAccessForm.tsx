"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, LockOpen, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export function UnlockAccessForm(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to unlock your subscription right now.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error while unlocking access. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 grid gap-3 rounded-xl border border-[var(--line)] p-4">
      <label htmlFor="unlock-email" className="text-sm font-medium text-[var(--text-soft)]">
        Already purchased? Unlock with your checkout email
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]" />
          <input
            id="unlock-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-[var(--line)] bg-[#0b1320] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--accent)]"
            placeholder="you@company.com"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex min-w-40 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#0c141d] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? <LoaderCircle size={16} className="animate-spin" /> : <LockOpen size={16} />}
          {isLoading ? "Checking..." : "Unlock Dashboard"}
        </button>
      </div>

      {error ? <p className="text-sm text-[#ff7b72]">{error}</p> : null}
    </form>
  );
}
