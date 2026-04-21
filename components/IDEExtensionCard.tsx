"use client";

import { motion } from "framer-motion";
import { Download, TerminalSquare } from "lucide-react";

import type { IDEExtension } from "@/types/accessibility";

interface IDEExtensionCardProps {
  extension: IDEExtension;
}

export function IDEExtensionCard({ extension }: IDEExtensionCardProps): React.JSX.Element {
  const downloadHref = `/api/downloads?file=${encodeURIComponent(extension.downloadFile)}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-[var(--line)] bg-[rgba(13,17,23,0.65)] p-5"
    >
      <p className="mono mb-2 text-xs uppercase tracking-wide text-[var(--accent-2)]">{extension.editor}</p>
      <h3 className="text-xl font-semibold">{extension.name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--text-soft)]">{extension.summary}</p>

      <ul className="mt-4 space-y-2 text-sm text-[var(--text-soft)]">
        {extension.includes.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <TerminalSquare className="mt-[2px]" size={14} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-[var(--text-soft)]">Package size: {extension.packageSize}</p>

      <a
        href={downloadHref}
        className="mt-4 inline-flex items-center gap-2 rounded-md border border-[var(--line-strong)] bg-[var(--bg-emphasis)] px-4 py-2 text-sm font-medium transition hover:border-[var(--accent)]"
      >
        <Download size={15} /> Download
      </a>
    </motion.article>
  );
}
