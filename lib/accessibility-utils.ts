export type LandmarkType = "function" | "class" | "import" | "todo" | "warning";

export interface CodeLandmark {
  line: number;
  type: LandmarkType;
  label: string;
  context: string;
}

const FUNCTION_REGEX = /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)/;
const CLASS_REGEX = /^(?:export\s+)?class\s+([A-Za-z0-9_]+)/;
const IMPORT_REGEX = /^import\s.+from\s+["'].+["'];?$/;

export function extractCodeLandmarks(source: string): CodeLandmark[] {
  const landmarks: CodeLandmark[] = [];
  const lines = source.split(/\r?\n/);

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      return;
    }

    const functionMatch = line.match(FUNCTION_REGEX);
    if (functionMatch) {
      landmarks.push({
        line: index + 1,
        type: "function",
        label: `Function ${functionMatch[1]}`,
        context: rawLine,
      });
      return;
    }

    const classMatch = line.match(CLASS_REGEX);
    if (classMatch) {
      landmarks.push({
        line: index + 1,
        type: "class",
        label: `Class ${classMatch[1]}`,
        context: rawLine,
      });
      return;
    }

    if (IMPORT_REGEX.test(line)) {
      landmarks.push({
        line: index + 1,
        type: "import",
        label: "Module import",
        context: rawLine,
      });
      return;
    }

    if (/\b(TODO|FIXME)\b/i.test(line)) {
      landmarks.push({
        line: index + 1,
        type: "todo",
        label: "TODO or FIXME note",
        context: rawLine,
      });
      return;
    }

    if (/\b(throw\s+new|console\.error|catch\s*\()/.test(line)) {
      landmarks.push({
        line: index + 1,
        type: "warning",
        label: "Potential error-handling block",
        context: rawLine,
      });
    }
  });

  return landmarks;
}

export function buildAudioSummary(landmarks: CodeLandmark[], lineCount: number): string {
  if (lineCount === 0) {
    return "This file is empty.";
  }

  if (landmarks.length === 0) {
    return `Scanned ${lineCount} lines. No major structural landmarks were detected.`;
  }

  const summaryByType = landmarks.reduce<Record<LandmarkType, number>>(
    (acc, item) => {
      acc[item.type] += 1;
      return acc;
    },
    {
      function: 0,
      class: 0,
      import: 0,
      todo: 0,
      warning: 0,
    },
  );

  return [
    `Scanned ${lineCount} lines and found ${landmarks.length} landmarks.`,
    `${summaryByType.import} imports, ${summaryByType.class} classes, ${summaryByType.function} functions.`,
    `${summaryByType.todo} TODO markers and ${summaryByType.warning} error-handling hotspots.`,
  ].join(" ");
}

export function tactileCueForType(type: LandmarkType): string {
  switch (type) {
    case "function":
      return "pulse-pulse";
    case "class":
      return "long-pulse";
    case "import":
      return "tick";
    case "todo":
      return "double-tick";
    case "warning":
      return "buzz-buzz";
    default:
      return "tick";
  }
}

export function defaultDemoSnippet(): string {
  return [
    "import { readFileSync } from 'node:fs';",
    "",
    "class AccessibilityNavigator {",
    "  constructor(private readonly sourcePath: string) {}",
    "",
    "  async functionPlaceholder() {}",
    "",
    "  summarize() {",
    "    // TODO: add support for tactile hardware output",
    "    try {",
    "      return readFileSync(this.sourcePath, 'utf-8');",
    "    } catch (error) {",
    "      console.error(error);",
    "      throw new Error('Unable to read source file');",
    "    }",
    "  }",
    "}",
    "",
    "export async function runNavigator(path: string) {",
    "  const nav = new AccessibilityNavigator(path);",
    "  return nav.summarize();",
    "}",
  ].join("\n");
}
