export type LandmarkKind = "class" | "function" | "interface" | "type" | "constant" | "region" | "comment";

export interface CodeLandmark {
  id: string;
  kind: LandmarkKind;
  label: string;
  line: number;
  snippet: string;
}

const LINE_PATTERNS: Array<{ kind: LandmarkKind; regex: RegExp }> = [
  { kind: "class", regex: /^\s*export\s+class\s+([A-Za-z0-9_]+)/ },
  { kind: "class", regex: /^\s*class\s+([A-Za-z0-9_]+)/ },
  { kind: "function", regex: /^\s*export\s+async\s+function\s+([A-Za-z0-9_]+)/ },
  { kind: "function", regex: /^\s*export\s+function\s+([A-Za-z0-9_]+)/ },
  { kind: "function", regex: /^\s*async\s+function\s+([A-Za-z0-9_]+)/ },
  { kind: "function", regex: /^\s*function\s+([A-Za-z0-9_]+)/ },
  { kind: "interface", regex: /^\s*export\s+interface\s+([A-Za-z0-9_]+)/ },
  { kind: "type", regex: /^\s*export\s+type\s+([A-Za-z0-9_]+)/ },
  { kind: "constant", regex: /^\s*export\s+const\s+([A-Za-z0-9_]+)/ },
  { kind: "constant", regex: /^\s*const\s+([A-Za-z0-9_]+)\s*=\s*\(/ },
  { kind: "region", regex: /^\s*\/\/\s*region\s+(.+)/i },
  { kind: "comment", regex: /^\s*\/\/\s*TODO\s*:?\s*(.+)/i },
];

function normalizeLabel(kind: LandmarkKind, raw: string) {
  if (kind === "comment" || kind === "region") {
    return raw.trim();
  }
  return `${kind} ${raw.trim()}`;
}

export function extractCodeLandmarks(code: string): CodeLandmark[] {
  const lines = code.split(/\r?\n/);
  const landmarks: CodeLandmark[] = [];

  lines.forEach((line, index) => {
    for (const pattern of LINE_PATTERNS) {
      const match = line.match(pattern.regex);
      if (!match?.[1]) {
        continue;
      }

      landmarks.push({
        id: `${pattern.kind}-${index + 1}-${match[1]}`,
        kind: pattern.kind,
        label: normalizeLabel(pattern.kind, match[1]),
        line: index + 1,
        snippet: line.trim(),
      });
      break;
    }
  });

  if (landmarks.length === 0 && lines.length > 0) {
    return [
      {
        id: "fallback-start",
        kind: "comment",
        label: "File start",
        line: 1,
        snippet: lines[0]?.trim() || "Empty line",
      },
    ];
  }

  return landmarks;
}

export function summarizeCodeForScreenReader(code: string, landmarks: CodeLandmark[]): string {
  const totalLines = code.split(/\r?\n/).length;
  const classes = landmarks.filter((l) => l.kind === "class").length;
  const functions = landmarks.filter((l) => l.kind === "function").length;
  const todos = landmarks.filter((l) => l.kind === "comment").length;

  return [
    `Total lines: ${totalLines}.`,
    `Detected ${classes} classes and ${functions} functions.`,
    todos > 0 ? `There are ${todos} TODO comments requiring attention.` : "No TODO comments detected.",
  ].join(" ");
}

export function triggerTactileFeedback(pattern: number | number[]) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }

  navigator.vibrate(pattern);
}
