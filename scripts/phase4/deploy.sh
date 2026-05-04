#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-/opt/docker/docker-compose.yml}"
SERVICES=(simplehome_db simplehome_backend simplehome_frontend)

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[ERROR] Missing required command: $1" >&2
    exit 1
  fi
}

wait_for_health() {
  local container_name="$1"
  local timeout_seconds="${2:-120}"
  local start_time
  start_time="$(date +%s)"

  while true; do
    local status
    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container_name" 2>/dev/null || echo missing)"

    if [[ "$status" == "healthy" || "$status" == "none" ]]; then
      echo "[OK] $container_name is $status"
      return 0
    fi

    if [[ "$status" == "missing" ]]; then
      echo "[ERROR] Container not found: $container_name" >&2
      return 1
    fi

    local now
    now="$(date +%s)"
    if (( now - start_time > timeout_seconds )); then
      echo "[ERROR] Timeout waiting for $container_name (last status: $status)" >&2
      docker logs --tail 120 "$container_name" || true
      return 1
    fi

    sleep 3
  done
}

require_cmd docker

echo "[INFO] Validating compose file: $COMPOSE_FILE"
docker compose -f "$COMPOSE_FILE" config >/dev/null

echo "[INFO] Building SimpleHome images"
docker compose -f "$COMPOSE_FILE" build "${SERVICES[@]}"

echo "[INFO] Starting services"
docker compose -f "$COMPOSE_FILE" up -d "${SERVICES[@]}"

echo "[INFO] Waiting for health checks"
wait_for_health simplehome_db 120
wait_for_health simplehome_backend 180
wait_for_health simplehome_frontend 240

echo "[INFO] Service status"
docker compose -f "$COMPOSE_FILE" ps "${SERVICES[@]}"

echo "[DONE] SimpleHome Phase 4 deployment completed."
