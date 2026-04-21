import path from "node:path";

import type { IDEExtension } from "@/types/accessibility";

export const extensionCatalog: IDEExtension[] = [
  {
    id: "vscode-sonic-nav",
    name: "Sonic Navigation Profile",
    editor: "Visual Studio Code",
    summary:
      "Adds spoken breadcrumb cues, structural jump aliases, and announcement-friendly keybindings for symbol navigation.",
    includes: [
      "Accessible keymap with conflict-safe overrides",
      "Screen reader optimized command labels",
      "Semantic jump presets for classes, functions, and diagnostics"
    ],
    installSteps: [
      "Open VS Code settings JSON and merge the included keybindings.",
      "Enable Screen Reader Optimized mode in the extension settings.",
      "Run the quick calibration command to set speech tempo by language."
    ],
    downloadFile: "vscode-sonic-nav-profile.json",
    category: "audio-navigation",
    packageSize: "7 KB"
  },
  {
    id: "jetbrains-verbal-map",
    name: "JetBrains Verbal Map",
    editor: "IntelliJ / WebStorm",
    summary:
      "Installs an accessibility-first keymap that exposes code structure through predictable spoken output and diagnostic loops.",
    includes: [
      "Custom keymap XML for editor and project tree traversal",
      "Priority hotkeys for error, warning, and TODO sweeps",
      "Code block boundary markers tuned for screen readers"
    ],
    installSteps: [
      "Import the XML keymap in Keymap settings.",
      "Set focus follows selection for the project panel.",
      "Bind the spoken diagnostics macro to your preferred chord."
    ],
    downloadFile: "jetbrains-verbal-map.xml",
    category: "screen-reader",
    packageSize: "12 KB"
  },
  {
    id: "terminal-haptics-bridge",
    name: "Terminal Haptics Bridge",
    editor: "CLI + Desktop Companion",
    summary:
      "Connects compiler events to haptic devices so build errors, test failures, and breakpoint hits are felt instantly.",
    includes: [
      "Shell script for piping test/build output to haptic alerts",
      "Pattern presets for pass, fail, and lint severity",
      "Portable profile format for different tactile devices"
    ],
    installSteps: [
      "Copy the shell script to your local bin directory.",
      "Set your tactile device endpoint in the profile section.",
      "Pipe CI or local terminal output through the script wrapper."
    ],
    downloadFile: "terminal-haptics-bridge.sh",
    category: "tactile-feedback",
    packageSize: "4 KB"
  }
];

const allowedFiles = new Set(extensionCatalog.map((item) => item.downloadFile));

export function getProtectedDownloadPath(filename: string): string | null {
  if (!allowedFiles.has(filename)) {
    return null;
  }

  return path.join(process.cwd(), "protected-downloads", filename);
}
