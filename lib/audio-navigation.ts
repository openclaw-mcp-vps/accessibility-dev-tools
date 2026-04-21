export type NavigationAnchorKind = "function" | "class" | "comment" | "region";

export interface NavigationAnchor {
  kind: NavigationAnchorKind;
  label: string;
  line: number;
}

export interface SpokenLine {
  lineNumber: number;
  raw: string;
  spoken: string;
}

const FUNCTION_PATTERN =
  /^\s*(export\s+)?(async\s+)?(function\s+\w+|const\s+\w+\s*=\s*\(?.*\)?\s*=>|\w+\s*\(.*\)\s*\{)/;
const CLASS_PATTERN = /^\s*(export\s+)?class\s+\w+/;
const REGION_PATTERN = /^\s*#region\s+(.+)/;
const COMMENT_PATTERN = /^\s*\/\/\s*(.+)$/;

export function toLines(source: string): string[] {
  return source.replace(/\r\n/g, "\n").split("\n");
}

export function extractNavigationAnchors(source: string): NavigationAnchor[] {
  const lines = toLines(source);

  return lines
    .map((raw, index) => {
      const line = raw.trim();

      if (!line) {
        return null;
      }

      if (CLASS_PATTERN.test(line)) {
        return {
          kind: "class",
          label: line.replace("{", "").trim(),
          line: index + 1
        } satisfies NavigationAnchor;
      }

      if (FUNCTION_PATTERN.test(line)) {
        return {
          kind: "function",
          label: line.replace("{", "").trim(),
          line: index + 1
        } satisfies NavigationAnchor;
      }

      const regionMatch = line.match(REGION_PATTERN);
      if (regionMatch) {
        return {
          kind: "region",
          label: regionMatch[1].trim(),
          line: index + 1
        } satisfies NavigationAnchor;
      }

      const commentMatch = line.match(COMMENT_PATTERN);
      if (commentMatch && commentMatch[1].length > 25) {
        return {
          kind: "comment",
          label: commentMatch[1].trim(),
          line: index + 1
        } satisfies NavigationAnchor;
      }

      return null;
    })
    .filter((anchor): anchor is NavigationAnchor => anchor !== null)
    .slice(0, 120);
}

export function symbolsToSpeech(input: string): string {
  return input
    .replace(/\{/g, " open brace ")
    .replace(/\}/g, " close brace ")
    .replace(/\(/g, " open paren ")
    .replace(/\)/g, " close paren ")
    .replace(/=>/g, " arrow ")
    .replace(/===/g, " triple equals ")
    .replace(/==/g, " double equals ")
    .replace(/&&/g, " and ")
    .replace(/\|\|/g, " or ")
    .replace(/\*/g, " star ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildSpokenLines(source: string): SpokenLine[] {
  return toLines(source).map((raw, index) => ({
    lineNumber: index + 1,
    raw,
    spoken: symbolsToSpeech(raw)
  }));
}

export function clampLine(target: number, source: string): number {
  const lines = toLines(source);
  if (lines.length === 0) {
    return 1;
  }
  return Math.max(1, Math.min(target, lines.length));
}

export function estimateSpeechDurationMs(text: string, wordsPerMinute = 165): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (!words) {
    return 0;
  }
  return Math.ceil((words / wordsPerMinute) * 60_000);
}
