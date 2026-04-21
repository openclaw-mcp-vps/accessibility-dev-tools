import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hasPaidAccess } from "@/lib/auth";

const DOWNLOAD_FILES: Record<
  string,
  {
    title: string;
    description: string;
    format: string;
    mimeType: string;
    content: string;
  }
> = {
  "vscode-screen-reader-profile": {
    title: "VS Code Screen Reader Profile",
    description: "Recommended `settings.json` profile tuned for low-noise screen reader coding workflows.",
    format: "json",
    mimeType: "application/json",
    content: JSON.stringify(
      {
        "editor.accessibilitySupport": "on",
        "editor.minimap.enabled": false,
        "editor.stickyScroll.enabled": false,
        "editor.renderWhitespace": "boundary",
        "editor.wordWrap": "on",
        "editor.inlayHints.enabled": "off",
        "editor.inlineSuggest.enabled": false,
        "editor.quickSuggestions": {
          strings: false,
          comments: false,
          other: true,
        },
        "breadcrumbs.enabled": false,
        "workbench.tree.indent": 18,
        "workbench.list.keyboardNavigation": "highlight",
        "terminal.integrated.enableBell": true,
        "terminal.integrated.smoothScrolling": false,
        "debug.toolBarLocation": "docked",
        "accessibility.signals.lineHasError": {
          sound: "on",
          announcement: "auto",
        },
        "accessibility.signals.taskCompleted": {
          sound: "on",
          announcement: "off",
        },
      },
      null,
      2,
    ),
  },
  "vscode-keybindings-pack": {
    title: "Code Navigation Keybindings Pack",
    description: "Keyboard map that adds reliable symbol traversal and problem-list shortcuts for screen readers.",
    format: "json",
    mimeType: "application/json",
    content: JSON.stringify(
      [
        {
          key: "ctrl+alt+j",
          command: "workbench.action.gotoSymbol",
          when: "editorTextFocus",
        },
        {
          key: "ctrl+alt+n",
          command: "editor.action.marker.next",
          when: "editorTextFocus",
        },
        {
          key: "ctrl+alt+p",
          command: "editor.action.marker.prev",
          when: "editorTextFocus",
        },
        {
          key: "ctrl+alt+r",
          command: "references-view.find",
          when: "editorTextFocus",
        },
        {
          key: "ctrl+alt+l",
          command: "workbench.action.focusActiveEditorGroup",
        },
        {
          key: "ctrl+alt+u",
          command: "workbench.action.focusProblemsFromFilter",
        },
      ],
      null,
      2,
    ),
  },
  "tactile-feedback-cli": {
    title: "Tactile Feedback CLI Helper",
    description: "Shell utility that maps compiler outcomes to device vibration patterns on supported hardware.",
    format: "sh",
    mimeType: "text/x-shellscript",
    content: `#!/usr/bin/env bash
set -euo pipefail

result="\${1:-}"

if [[ -z "$result" ]]; then
  echo "Usage: tactile-feedback-cli <success|warning|error>"
  exit 1
fi

case "$result" in
  success)
    printf '\a'
    sleep 0.1
    printf '\a'
    echo "Pattern: short-short"
    ;;
  warning)
    printf '\a'
    sleep 0.3
    printf '\a'
    echo "Pattern: medium-medium"
    ;;
  error)
    printf '\a\a\a'
    echo "Pattern: triple alert"
    ;;
  *)
    echo "Unknown result '$result'. Use success, warning, or error."
    exit 1
    ;;
esac
`,
  },
  "onboarding-accessibility-guide": {
    title: "Blind Developer Onboarding Guide",
    description: "Practical setup checklist for teams deploying accessible IDE standards in production environments.",
    format: "md",
    mimeType: "text/markdown",
    content: `# Accessibility Dev Tools Onboarding Guide

## 1. IDE Baseline
- Apply the provided screen-reader settings profile.
- Import the navigation keybindings pack.
- Disable UI chrome that creates redundant announcements.

## 2. Terminal Baseline
- Keep line wrapping enabled.
- Ensure bell notifications are active for task completion and failures.
- Add aliases for frequent diagnostics commands.

## 3. Team Workflow
- Require semantic commit messages so spoken git logs remain concise.
- Add CI summary comments with plain-language failure hints.
- Keep pull request descriptions structured with headings for keyboard jumps.

## 4. Accessibility QA
- Verify debugger stepping announces file and line changes.
- Validate symbol navigation across files larger than 1,000 lines.
- Test at least one workflow daily using NVDA/JAWS/VoiceOver to prevent regressions.
`,
  },
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  const cookieStore = await cookies();

  if (!hasPaidAccess(cookieStore)) {
    return NextResponse.json({ message: "Access denied. Complete checkout first." }, { status: 403 });
  }

  const url = new URL(request.url);
  const requestedFile = url.searchParams.get("file");

  if (!requestedFile) {
    return NextResponse.json({
      files: Object.entries(DOWNLOAD_FILES).map(([slug, file]) => ({
        slug,
        title: file.title,
        description: file.description,
        format: file.format,
      })),
    });
  }

  const file = DOWNLOAD_FILES[requestedFile];

  if (!file) {
    return NextResponse.json({ message: "Requested file does not exist." }, { status: 404 });
  }

  return new NextResponse(file.content, {
    status: 200,
    headers: {
      "Content-Type": `${file.mimeType}; charset=utf-8`,
      "Content-Disposition": `attachment; filename="${requestedFile}.${file.format}"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
