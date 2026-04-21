const vscode = require("vscode");

function speak(message) {
  vscode.window.showInformationMessage(message);
}

function jumpToNextFunction(editor) {
  const text = editor.document.getText();
  const offset = editor.document.offsetAt(editor.selection.active);
  const remaining = text.slice(offset + 1);
  const match = remaining.match(/\n\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)/);

  if (!match || match.index === undefined) {
    speak("No additional function landmarks found in this file.");
    return;
  }

  const newOffset = offset + 1 + match.index + 1;
  const position = editor.document.positionAt(newOffset);
  editor.selection = new vscode.Selection(position, position);
  editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
  speak(`Moved to function ${match[1]} at line ${position.line + 1}.`);
}

function announceDiagnostics(editor) {
  const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);

  if (diagnostics.length === 0) {
    speak("No diagnostics in the current file.");
    return;
  }

  const preview = diagnostics
    .slice(0, 5)
    .map((diag) => {
      const severity = ["error", "warning", "information", "hint"][diag.severity] || "issue";
      return `${severity} line ${diag.range.start.line + 1}: ${diag.message}`;
    })
    .join("; ");

  speak(`Diagnostics summary: ${preview}`);
}

function activate(context) {
  const readLine = vscode.commands.registerCommand("accessibilityNavigator.readCurrentLine", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const lineNumber = editor.selection.active.line;
    const text = editor.document.lineAt(lineNumber).text.trim() || "blank line";
    speak(`Line ${lineNumber + 1}: ${text}`);
  });

  const jumpFunction = vscode.commands.registerCommand("accessibilityNavigator.jumpToNextFunction", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    jumpToNextFunction(editor);
  });

  const diagnostics = vscode.commands.registerCommand("accessibilityNavigator.announceDiagnostics", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    announceDiagnostics(editor);
  });

  context.subscriptions.push(readLine, jumpFunction, diagnostics);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
