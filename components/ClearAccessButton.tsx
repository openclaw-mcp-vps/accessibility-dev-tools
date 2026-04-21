"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ClearAccessButton() {
  const [loading, setLoading] = useState(false);

  async function clearAccess() {
    setLoading(true);
    try {
      await fetch("/api/access", { method: "DELETE" });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={() => void clearAccess()} disabled={loading}>
      {loading ? "Clearing..." : "Clear Access Cookie"}
    </Button>
  );
}
