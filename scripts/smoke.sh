#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"

echo "[smoke] GET $BASE_URL/health/live"
curl -fsS "$BASE_URL/health/live" > /dev/null

echo "[smoke] GET $BASE_URL/health/ready"
curl -fsS "$BASE_URL/health/ready" > /dev/null

echo "[smoke] GET $BASE_URL/version"
curl -fsS "$BASE_URL/version"

echo
echo "[smoke] OK"