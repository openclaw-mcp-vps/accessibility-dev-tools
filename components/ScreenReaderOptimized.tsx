"use client";

import { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import { VisuallyHidden } from "react-aria";

interface ScreenReaderOptimizedProps {
  title: string;
  description: string;
  children: ReactNode;
  announceOnMount?: string;
}

export function ScreenReaderOptimized({
  title,
  description,
  children,
  announceOnMount,
}: ScreenReaderOptimizedProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [liveMessage, setLiveMessage] = useState(announceOnMount ?? "");

  useEffect(() => {
    const fallbackMessage = `${title} loaded. ${description}`;
    setLiveMessage(announceOnMount || fallbackMessage);
  }, [announceOnMount, description, title]);

  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5"
    >
      <header className="space-y-2">
        <h2 id={titleId} className="text-xl font-semibold text-slate-100">
          {title}
        </h2>
        <p id={descriptionId} className="text-sm leading-relaxed text-slate-300">
          {description}
        </p>
      </header>

      <VisuallyHidden>
        <p aria-live="polite" aria-atomic="true">
          {liveMessage}
        </p>
      </VisuallyHidden>

      <div>{children}</div>
    </section>
  );
}
