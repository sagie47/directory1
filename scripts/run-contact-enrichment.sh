#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/generated/business-contact-enrichment"
LOG_FILE="$OUTPUT_DIR/run.log"
PID_FILE="$OUTPUT_DIR/run.pid"

mkdir -p "$OUTPUT_DIR"

if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "Contact enrichment is already running with PID $(cat "$PID_FILE")."
  exit 1
fi

cd "$ROOT_DIR"

nohup node --import tsx/esm scripts/enrich-business-contacts.ts "$@" >"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"

echo "Started contact enrichment with PID $(cat "$PID_FILE")."
echo "Log: $LOG_FILE"
