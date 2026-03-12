#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="$ROOT_DIR/generated/gmaps-scraper"
QUEUE_LOG="$WORK_DIR/local-queue.log"

wait_for_container_exit() {
  local name="$1"

  while docker ps --filter "name=^/${name}$" --format '{{.Names}}' | grep -q "^${name}$"; do
    printf '[%s] waiting for %s to finish\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$name" >> "$QUEUE_LOG"
    sleep 60
  done
}

run_city() {
  local city="$1"
  local query_file="$WORK_DIR/${city}-queries.txt"
  local result_file="$WORK_DIR/${city}-full-results.json"
  local container_name="gmaps-${city}-full"

  printf '[%s] starting %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$city" >> "$QUEUE_LOG"
  docker rm -f "$container_name" >/dev/null 2>&1 || true
  docker run --rm -v "$WORK_DIR:/work" --name "$container_name" gosom/google-maps-scraper \
    -input "/work/${city}-queries.txt" \
    -results "/work/${city}-full-results.json" \
    -json -lang en -c 1 >> "$QUEUE_LOG" 2>&1
  printf '[%s] completed %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$city" >> "$QUEUE_LOG"
}

mkdir -p "$WORK_DIR"
printf '[%s] queue booted\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" > "$QUEUE_LOG"

wait_for_container_exit "gmaps-west-kelowna-full"
run_city "peachland"

printf '[%s] queue finished\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" >> "$QUEUE_LOG"
