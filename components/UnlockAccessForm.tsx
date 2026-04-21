"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UnlockAccessForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [statusText, setStatusText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusText("Checking subscription status...");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatusText(payload.message || "We could not verify an active subscription for this email.");
        return;
      }

      setStatusText("Access unlocked. Loading your dashboard...");
      router.refresh();
    } catch {
      setStatusText("Network error while verifying your subscription. Try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-label="Unlock paid access">
      <div className="space-y-2">
        <label htmlFor="unlock-email" className="text-sm font-medium text-slate-200">
          Stripe checkout email
        </label>
        <input
          id="unlock-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input-dark w-full rounded-md px-3 py-2 text-sm"
          placeholder="you@company.com"
        />
      </div>

      <Button type="submit" disabled={isSubmitting || email.length < 5} className="w-full sm:w-auto">
        {isSubmitting ? "Verifying..." : "Unlock My Tools"}
      </Button>

      <p className="text-sm text-slate-300" role="status" aria-live="polite">
        {statusText}
      </p>
    </form>
  );
}
