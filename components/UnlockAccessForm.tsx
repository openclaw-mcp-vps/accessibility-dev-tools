"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UnlockAccessForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus(payload.error ?? "Unable to verify purchase. Confirm your payment email.");
        return;
      }

      setStatus("Access unlocked. Redirecting to dashboard...");
      window.location.href = "/dashboard";
    } catch {
      setStatus("Connection error. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={unlock} className="grid gap-3" aria-label="Unlock paid access">
      <Label htmlFor="purchase-email">Purchase email</Label>
      <Input
        id="purchase-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@company.com"
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Verifying..." : "Unlock My Access"}
      </Button>
      <p className="text-sm text-[var(--muted-foreground)]" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
