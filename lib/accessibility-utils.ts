export type AccessibilityIssue = {
  id: string;
  line: number;
  severity: "low" | "medium" | "high";
  message: string;
  recommendation: string;
};

export type KeyboardShortcut = {
  keys: string;
  action: string;
};

export const keyboardShortcuts: KeyboardShortcut[] = [
  { keys: "Alt+1", action: "Focus editor" },
  { keys: "Alt+2", action: "Run accessibility scan" },
  { keys: "Alt+3", action: "Read current line" },
  { keys: "Alt+4", action: "Start voice command mode" },
  { keys: "Alt+5", action: "Jump to diagnostics" }
];

export function scanCodeForAccessibility(source: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const lines = source.split("\n");
  let issueCount = 0;

  lines.forEach((lineText, index) => {
    const line = index + 1;

    if (/<img(?![^>]*\balt=)/.test(lineText)) {
      issueCount += 1;
      issues.push({
        id: `issue-${issueCount}`,
        line,
        severity: "high",
        message: "Image element is missing an alt attribute.",
        recommendation: "Add meaningful alt text or use alt=\"\" for decorative images."
      });
    }

    if (/<div[^>]*\bonClick=/.test(lineText) && !/onKey(?:Down|Up|Press)=/.test(lineText)) {
      issueCount += 1;
      issues.push({
        id: `issue-${issueCount}`,
        line,
        severity: "high",
        message: "Clickable div does not expose keyboard handlers.",
        recommendation: "Use a semantic button or add keyboard handlers with role and tabIndex."
      });
    }

    if (/<input(?![^>]*(aria-label|aria-labelledby|id=))/.test(lineText)) {
      issueCount += 1;
      issues.push({
        id: `issue-${issueCount}`,
        line,
        severity: "medium",
        message: "Input may be unlabeled for screen readers.",
        recommendation: "Associate a label using htmlFor/id or provide aria-label."
      });
    }

    if (/style=\{\{[^}]*outline:\s*['\"]?none/.test(lineText)) {
      issueCount += 1;
      issues.push({
        id: `issue-${issueCount}`,
        line,
        severity: "medium",
        message: "Focus outline is removed.",
        recommendation: "Keep visible focus styles for keyboard users."
      });
    }
  });

  return issues;
}

export function summarizeAccessibilityIssues(issues: AccessibilityIssue[]): string {
  if (!issues.length) {
    return "No obvious accessibility issues were detected in this pass.";
  }

  const high = issues.filter((item) => item.severity === "high").length;
  const medium = issues.filter((item) => item.severity === "medium").length;
  const low = issues.filter((item) => item.severity === "low").length;

  return `${issues.length} issues found: ${high} high, ${medium} medium, ${low} low severity.`;
}

export function getLineText(source: string, lineNumber: number): string {
  const lines = source.split("\n");
  if (lineNumber < 1 || lineNumber > lines.length) {
    return "Line out of range.";
  }

  return lines[lineNumber - 1]?.trim() || "Blank line";
}

export function parseLineCommand(transcript: string): number | null {
  const match = transcript.match(/line\s+(\d+)/i);
  if (!match) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

export function estimateReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min listen`;
}
