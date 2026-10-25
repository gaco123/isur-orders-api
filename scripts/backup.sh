#!/usr/bin/env bash
set -euo pipefail

# Uso: ./scripts/backup.sh [contenedor_db]
DB_CONTAINER="${1:-isur-orders-api-db-1}"
DB_NAME="${DB_NAME:-isur_orders}"
DB_USER="${DB_USER:-isur_app}"
OUT_DIR="${OUT_DIR:-./backups}"

mkdir -p "$OUT_DIR"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_FILE="$OUT_DIR/${DB_NAME}_${STAMP}.sql.gz"

echo "[backup] exportando $DB_NAME desde $DB_CONTAINER -> $OUT_FILE"
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$OUT_FILE"
echo "[backup] OK"