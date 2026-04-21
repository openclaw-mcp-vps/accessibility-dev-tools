"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DownloadAsset {
  slug: string;
  title: string;
  description: string;
  format: string;
}

interface DownloadClientProps {
  initialSessionId?: string;
}

export default function DownloadClient({ initialSessionId = "" }: DownloadClientProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [assets, setAssets] = useState<DownloadAsset[]>([]);
  const [statusMessage, setStatusMessage] = useState("Checking access...");
  const [isLoading, setIsLoading] = useState(true);

  const stripePaymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK as string;

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    const response = await fetch("/api/download", { cache: "no-store" });

    if (response.status === 403) {
      setIsAuthorized(false);
      setStatusMessage("Access locked. Complete checkout and enter your Stripe session ID.");
      setAssets([]);
      setIsLoading(false);
      return;
    }

    if (!response.ok) {
      setIsAuthorized(false);
      setStatusMessage("Unable to load downloads. Please try again.");
      setAssets([]);
      setIsLoading(false);
      return;
    }

    const payload = (await response.json()) as { files: DownloadAsset[] };
    setAssets(payload.files);
    setIsAuthorized(true);
    setStatusMessage("Access unlocked. Download your tool packs below.");
    setIsLoading(false);
  }, []);

  const unlockAccess = useCallback(async () => {
    if (!sessionId.trim()) {
      setStatusMessage("Enter the Stripe checkout session ID from your success page.");
      return;
    }

    setIsLoading(true);

    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionId.trim() }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ message: "Unable to verify session." }))) as {
        message?: string;
      };
      setStatusMessage(payload.message || "Unable to verify session.");
      setIsLoading(false);
      return;
    }

    setStatusMessage("Payment verified. Loading downloads...");
    await fetchAssets();
  }, [fetchAssets, sessionId]);

  useEffect(() => {
    fetchAssets().catch(() => {
      setStatusMessage("Unable to check access right now.");
      setIsLoading(false);
    });
  }, [fetchAssets]);

  useEffect(() => {
    if (!initialSessionId) {
      return;
    }

    unlockAccess().catch(() => {
      setStatusMessage("Session verification failed. Paste the session ID and try again.");
    });
  }, [initialSessionId, unlockAccess]);

  const assetCountLabel = useMemo(() => {
    if (!isAuthorized) {
      return "Locked assets";
    }

    return `${assets.length} downloadable assets`;
  }, [assets.length, isAuthorized]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Download Portal</CardTitle>
          <CardDescription>
            Paid users can download IDE extension packs, tactile scripts, and onboarding docs from this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="rounded-md border border-slate-600 bg-slate-900/70 p-3 text-sm text-slate-200" aria-live="polite">
            {statusMessage}
          </p>

          {!isAuthorized && (
            <div className="space-y-3">
              <a
                href={stripePaymentLink}
                className="inline-flex items-center rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Complete Checkout on Stripe
              </a>
              <label className="block text-sm text-slate-200" htmlFor="session-id">
                Stripe Checkout Session ID
              </label>
              <input
                id="session-id"
                value={sessionId}
                onChange={(event) => setSessionId(event.target.value)}
                placeholder="cs_test_..."
                className="w-full rounded-md border border-slate-600 bg-[#0b0f14] px-3 py-2 text-sm text-slate-100 focus:border-cyan-300 focus:outline-none"
              />
              <Button type="button" onClick={unlockAccess} disabled={isLoading}>
                Verify Purchase and Unlock
              </Button>
              <p className="text-xs text-slate-400">
                Tip: Configure your Stripe success URL to append{" "}
                <code className="rounded bg-slate-800 px-1 py-0.5">?session_id={"{CHECKOUT_SESSION_ID}"}</code> for
                automatic unlock when customers return.
              </p>
            </div>
          )}

          {isAuthorized && (
            <div>
              <p className="text-sm text-cyan-100">{assetCountLabel}</p>
              <ul className="mt-3 space-y-3">
                {assets.map((asset) => (
                  <li key={asset.slug} className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                    <h3 className="text-base font-semibold text-white">{asset.title}</h3>
                    <p className="mt-1 text-sm text-slate-300">{asset.description}</p>
                    <p className="mt-1 text-xs text-slate-400">Format: {asset.format}</p>
                    <a
                      href={`/api/download?file=${encodeURIComponent(asset.slug)}`}
                      className="mt-3 inline-flex rounded-md border border-cyan-300/50 px-3 py-1.5 text-sm font-medium text-cyan-100 hover:bg-cyan-500/10"
                    >
                      Download {asset.title}
                    </a>
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex rounded-md border border-slate-500 px-3 py-2 text-sm font-medium text-slate-100 hover:border-slate-300"
              >
                Open Accessibility Dashboard
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
