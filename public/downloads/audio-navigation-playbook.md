# Audio Navigation Playbook

## Goal
Move through a codebase by meaning, not by raw line scanning.

## Session Setup
1. Turn punctuation to **most** in your screen reader profile.
2. Enable editor breadcrumbs and keep symbol outline open.
3. Bind next/previous diagnostic to fast keyboard shortcuts.

## High-speed Workflow
1. Jump by symbol (`Go to Symbol in Editor`) to land near target code.
2. Use next diagnostic to sweep compiler errors in priority order.
3. Read only the surrounding region:
   - current function signature
   - failing line
   - nearest guard condition
4. Trigger test re-run and rely on tactile/audio status cues.

## Pull Request Review Routine
1. Open changed files list.
2. Navigate by hunk headers first.
3. For each hunk, listen for:
   - changed conditionals
   - removed null checks
   - async/await flow changes
4. Confirm every warning has explicit handling before approval.

## Team Adoption Checklist
- Share one standard keymap file.
- Add a 10-minute onboarding walkthrough.
- Capture tactile/audio profile defaults in repo docs.
