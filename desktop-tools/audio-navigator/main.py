#!/usr/bin/env python3
"""Audio Navigator: terminal companion for blind programmers.

This script scans a source file, extracts structural landmarks,
and prints a concise summary designed for text-to-speech tools.
"""

from __future__ import annotations

import argparse
import pathlib
import re
import subprocess
import sys
from dataclasses import dataclass
from typing import Iterable, List


@dataclass
class Landmark:
    line: int
    kind: str
    description: str
    content: str


FUNCTION_RE = re.compile(r"^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)")
CLASS_RE = re.compile(r"^\s*(?:export\s+)?class\s+([A-Za-z0-9_]+)")
IMPORT_RE = re.compile(r"^\s*import\s.+from\s+[\"'].+[\"'];?\s*$")
WARNING_RE = re.compile(r"\b(throw\s+new|console\.error|catch\s*\()")


def parse_landmarks(lines: Iterable[str]) -> List[Landmark]:
    results: List[Landmark] = []

    for idx, raw_line in enumerate(lines, start=1):
        line = raw_line.strip()
        if not line:
            continue

        function_match = FUNCTION_RE.match(line)
        if function_match:
            results.append(
                Landmark(
                    line=idx,
                    kind="function",
                    description=f"Function {function_match.group(1)}",
                    content=raw_line.rstrip(),
                )
            )
            continue

        class_match = CLASS_RE.match(line)
        if class_match:
            results.append(
                Landmark(
                    line=idx,
                    kind="class",
                    description=f"Class {class_match.group(1)}",
                    content=raw_line.rstrip(),
                )
            )
            continue

        if IMPORT_RE.match(line):
            results.append(
                Landmark(line=idx, kind="import", description="Module import", content=raw_line.rstrip())
            )
            continue

        if "TODO" in line or "FIXME" in line:
            results.append(
                Landmark(line=idx, kind="todo", description="TODO or FIXME note", content=raw_line.rstrip())
            )
            continue

        if WARNING_RE.search(line):
            results.append(
                Landmark(
                    line=idx,
                    kind="warning",
                    description="Potential error-handling block",
                    content=raw_line.rstrip(),
                )
            )

    return results


def build_summary(landmarks: List[Landmark], line_count: int) -> str:
    if line_count == 0:
        return "This file is empty."

    if not landmarks:
        return f"Scanned {line_count} lines. No structural landmarks detected."

    counts = {
        "import": 0,
        "class": 0,
        "function": 0,
        "todo": 0,
        "warning": 0,
    }

    for landmark in landmarks:
        counts[landmark.kind] = counts.get(landmark.kind, 0) + 1

    return (
        f"Scanned {line_count} lines with {len(landmarks)} landmarks. "
        f"Imports: {counts['import']}. Classes: {counts['class']}. Functions: {counts['function']}. "
        f"TODO markers: {counts['todo']}. Error hotspots: {counts['warning']}."
    )


def speak(text: str) -> None:
    """Send text to system TTS when available.

    macOS uses 'say'. Linux users can configure speech-dispatcher/espeak and
    adjust this command as needed.
    """

    if sys.platform == "darwin":
        subprocess.run(["say", text], check=False)



def main() -> int:
    parser = argparse.ArgumentParser(description="Analyze source code landmarks for audio navigation")
    parser.add_argument("source", type=pathlib.Path, help="Path to source file")
    parser.add_argument("--speak", action="store_true", help="Read summary aloud on supported systems")
    parser.add_argument(
        "--max-items",
        type=int,
        default=20,
        help="Maximum number of landmarks to print (default: 20)",
    )

    args = parser.parse_args()

    if not args.source.exists() or not args.source.is_file():
        print(f"Source file not found: {args.source}", file=sys.stderr)
        return 1

    content = args.source.read_text(encoding="utf-8")
    lines = content.splitlines()
    landmarks = parse_landmarks(lines)
    summary = build_summary(landmarks, len(lines))

    print(summary)
    print()

    for landmark in landmarks[: args.max_items]:
        print(f"Line {landmark.line:>4} | {landmark.kind:<8} | {landmark.description}")
        print(f"           {landmark.content.strip()}")

    if args.speak:
        speak(summary)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
