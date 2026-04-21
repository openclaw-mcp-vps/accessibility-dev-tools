"use client";

import { useEffect, useId, useState } from "react";

type ScreenReaderOptimizedProps = {
  children: React.ReactNode;
  initialAnnouncement?: string;
  className?: string;
};

export function ScreenReaderOptimized({ children, initialAnnouncement, className }: ScreenReaderOptimizedProps) {
  const liveRegionId = useId();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!initialAnnouncement) {
      return;
    }

    setMessage(initialAnnouncement);
  }, [initialAnnouncement]);

  return (
    <section className={className} aria-describedby={liveRegionId}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--accent)] focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--accent-foreground)]"
      >
        Skip to main content
      </a>

      <div id={liveRegionId} aria-live="polite" aria-atomic="true" className="sr-only">
        {message}
      </div>

      {children}
    </section>
  );
}
