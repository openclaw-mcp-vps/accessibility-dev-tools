export interface ExtensionAsset {
  id: string;
  title: string;
  description: string;
  format: "VSIX" | "JSON" | "MD";
  href: string;
  checksum: string;
}

export interface AccessibilityExtensionBundle {
  bundleName: string;
  targetIDE: "VS Code";
  minimumVersion: string;
  highlights: string[];
  assets: ExtensionAsset[];
}

const ACCESSIBILITY_BUNDLE: AccessibilityExtensionBundle = {
  bundleName: "CodeSense Access Pack",
  targetIDE: "VS Code",
  minimumVersion: "1.90.0",
  highlights: [
    "Semantic cursor landmarks for fast screen-reader jumps",
    "Audio breadcrumbs for function, class, and error navigation",
    "Keyboard-first diagnostics panel with speech-friendly labels"
  ],
  assets: [
    {
      id: "codesense-keymap",
      title: "Screen Reader Keymap",
      description:
        "Prebuilt keybindings optimized for NVDA, JAWS, and VoiceOver conflict-free navigation.",
      format: "JSON",
      href: "/downloads/vscode-screenreader-keymap.json",
      checksum: "sha256-2f96bf945f3d70e8ca5f614ec7ca83575f16b11b63af594be7a2f1949f693512"
    },
    {
      id: "audio-nav",
      title: "Audio Navigation Playbook",
      description:
        "Command reference with concrete workflows for symbol, diff, and test-output navigation.",
      format: "MD",
      href: "/downloads/audio-navigation-playbook.md",
      checksum: "sha256-3f3a643f490fac3013ebec2adf8e95f6ba90f1404b0a8ea24cf6716ca6f43003"
    },
    {
      id: "tactile-profile",
      title: "Tactile Feedback Profile",
      description:
        "Ready-to-import haptic profile mapping build statuses to vibration and speaker patterns.",
      format: "JSON",
      href: "/downloads/tactile-feedback-profile.json",
      checksum: "sha256-bf8d52f582dcf11d29732cab67da4f0f6ce76fd9d4db2473afda39f4730b6e9a"
    }
  ]
};

export function getVSCodeAccessibilityBundle(): AccessibilityExtensionBundle {
  return ACCESSIBILITY_BUNDLE;
}
