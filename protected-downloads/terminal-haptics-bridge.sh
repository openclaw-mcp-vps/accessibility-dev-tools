#!/usr/bin/env bash
set -euo pipefail

# Terminal Haptics Bridge: converts build/test output into structured tactile events.
# Usage: your_build_command 2>&1 | terminal-haptics-bridge.sh

DEVICE_ENDPOINT="${HAPTIC_DEVICE_ENDPOINT:-http://127.0.0.1:4556/event}"
PATTERN_PASS="short"
PATTERN_WARN="pulse"
PATTERN_FAIL="long"

emit_event() {
  local pattern="$1"
  local message="$2"
  curl -sS -X POST "$DEVICE_ENDPOINT" \
    -H 'Content-Type: application/json' \
    -d "{\"pattern\":\"${pattern}\",\"message\":\"${message}\"}" \
    >/dev/null || true
}

while IFS= read -r line; do
  echo "$line"
  lower_line="$(echo "$line" | tr '[:upper:]' '[:lower:]')"

  if [[ "$lower_line" == *"error"* ]] || [[ "$lower_line" == *"failed"* ]]; then
    emit_event "$PATTERN_FAIL" "error detected"
  elif [[ "$lower_line" == *"warning"* ]]; then
    emit_event "$PATTERN_WARN" "warning detected"
  elif [[ "$lower_line" == *"success"* ]] || [[ "$lower_line" == *"passed"* ]]; then
    emit_event "$PATTERN_PASS" "success detected"
  fi
done
