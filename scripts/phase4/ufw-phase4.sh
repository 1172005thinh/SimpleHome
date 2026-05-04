#!/usr/bin/env bash
set -euo pipefail

APPLY=0
if [[ "${1:-}" == "--apply" ]]; then
  APPLY=1
fi

rules=(
  "ufw default deny incoming"
  "ufw default allow outgoing"
  "ufw allow 80/tcp comment 'HTTP for NPM/ACME'"
  "ufw allow 443/tcp comment 'HTTPS for NPM'"
  "ufw allow 1883/tcp comment 'MQTT public broker'"
)

echo "[INFO] Phase 4 UFW rule plan:"
for rule in "${rules[@]}"; do
  echo "  sudo $rule"
done
echo "  sudo ufw status verbose"

if (( APPLY == 0 )); then
  echo
  echo "[INFO] Dry-run only. Re-run with --apply as root to execute."
  exit 0
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "[ERROR] --apply requires root. Run: sudo $0 --apply" >&2
  exit 1
fi

for rule in "${rules[@]}"; do
  eval "$rule"
done

ufw status verbose
echo "[DONE] UFW Phase 4 rules applied."
