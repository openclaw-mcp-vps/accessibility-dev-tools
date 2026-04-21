"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton(): React.JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await fetch("/api/auth", {
        method: "DELETE"
      });
    } finally {
      router.push("/");
      router.refresh();
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-[rgba(13,17,23,0.65)] px-3 py-2 text-sm transition hover:border-[var(--line-strong)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <LogOut size={16} />
      {isLoading ? "Signing out..." : "Sign out"}
    </button>
  );
}
