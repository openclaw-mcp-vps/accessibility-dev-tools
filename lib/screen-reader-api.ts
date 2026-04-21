export type VerbosityMode = "concise" | "standard" | "verbose";
export type PunctuationMode = "minimal" | "speak";

const SYMBOL_MAP: Record<string, string> = {
  "{": "open brace",
  "}": "close brace",
  "(": "open parenthesis",
  ")": "close parenthesis",
  "[": "open bracket",
  "]": "close bracket",
  "=>": "arrow",
  "===": "triple equals",
  "==": "double equals",
  "!==": "not equal",
  "&&": "logical and",
  "||": "logical or"
};

export function normalizeForScreenReader(
  line: string,
  punctuationMode: PunctuationMode
): string {
  if (punctuationMode === "minimal") {
    return line.replace(/\s+/g, " ").trim();
  }

  let output = line;
  for (const [symbol, speech] of Object.entries(SYMBOL_MAP)) {
    output = output.split(symbol).join(` ${speech} `);
  }

  return output.replace(/\s+/g, " ").trim();
}

export function buildLineAnnouncement(
  lineNumber: number,
  line: string,
  verbosity: VerbosityMode,
  punctuationMode: PunctuationMode
): string {
  const normalized = normalizeForScreenReader(line, punctuationMode);

  if (!normalized) {
    return `Line ${lineNumber}, empty line.`;
  }

  if (verbosity === "concise") {
    return `Line ${lineNumber}. ${normalized}`;
  }

  if (verbosity === "verbose") {
    return `Line ${lineNumber}. Code content: ${normalized}.`;
  }

  return `Line ${lineNumber}. ${normalized}.`;
}

export function summarizeCodeForAudio(
  source: string,
  verbosity: VerbosityMode
): string {
  const lines = source
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const functionCount = lines.filter((line) =>
    /^(export\s+)?(async\s+)?function\s+/.test(line) ||
    /^const\s+\w+\s*=\s*\(?.*\)?\s*=>/.test(line)
  ).length;
  const classCount = lines.filter((line) => /^(export\s+)?class\s+/.test(line)).length;

  if (verbosity === "concise") {
    return `${lines.length} non-empty lines, ${functionCount} functions, ${classCount} classes.`;
  }

  return `This snippet has ${lines.length} non-empty lines, ${functionCount} function definitions, and ${classCount} class declarations.`;
}
