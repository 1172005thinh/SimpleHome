#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-/opt/docker/docker-compose.yml}"
NPM_PROXY_DIR="${NPM_PROXY_DIR:-/opt/docker/npm/data/nginx/proxy_host}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[ERROR] Missing required command: $1" >&2
    exit 1
  fi
}

print_check() {
  echo
  echo "== $1 =="
}

container_health() {
  local name="$1"
  docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$name"
}

check_no_host_port() {
  local name="$1"
  local ports
  ports="$(docker inspect --format '{{json .NetworkSettings.Ports}}' "$name")"
  if [[ "$ports" == "{}" ]] || echo "$ports" | grep -Eq '^\{("[^"]+":null,?)+\}$'; then
    echo "[OK] $name has no host-exposed port"
  else
    echo "[WARN] $name still has published ports: $ports"
  fi
}

require_cmd docker

if command -v rg >/dev/null 2>&1; then
  match_exact_line() {
    rg -x "$1" >/dev/null
  }

  search_in_dir() {
    rg -n "$1" "$2" >/dev/null
  }
else
  match_exact_line() {
    grep -Fx "$1" >/dev/null
  }

  search_in_dir() {
    grep -REn "$1" "$2" >/dev/null
  }
fi

print_check "Compose config"
docker compose -f "$COMPOSE_FILE" config >/dev/null
echo "[OK] Compose syntax is valid"

print_check "Containers running"
for svc in simplehome_db simplehome_backend simplehome_frontend; do
  if docker ps --format '{{.Names}}' | match_exact_line "$svc"; then
    echo "[OK] $svc is running"
  else
    echo "[ERROR] $svc is not running"
    exit 1
  fi
done

print_check "Container health"
for svc in simplehome_db simplehome_backend simplehome_frontend; do
  status="$(container_health "$svc")"
  echo "[INFO] $svc health: $status"
done

print_check "Local health endpoint"
docker exec simplehome_backend node -e "fetch('http://127.0.0.1:4000/api/health').then((r)=>r.json().then((j)=>{console.log(JSON.stringify(j));process.exit(r.ok?0:1);})).catch(()=>process.exit(1))"
echo "[OK] Backend health endpoint is reachable"

print_check "Port exposure"
check_no_host_port simplehome_db
check_no_host_port simplehome_backend
check_no_host_port simplehome_frontend

print_check "NPM proxy host config"
if search_in_dir "dashboard\\.hungthinhcloud\\.freeddns\\.org" "$NPM_PROXY_DIR"; then
  echo "[OK] Dashboard proxy host exists"
else
  echo "[WARN] Dashboard proxy host not found in $NPM_PROXY_DIR"
fi

if search_in_dir "api\\.hungthinhcloud\\.freeddns\\.org" "$NPM_PROXY_DIR"; then
  echo "[OK] API proxy host exists"
else
  echo "[WARN] API proxy host not found in $NPM_PROXY_DIR"
fi

echo
echo "[DONE] Phase 4 verification finished."
