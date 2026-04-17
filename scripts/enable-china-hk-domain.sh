#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/henghesha-agent-marketplace}"
DOMAIN="${1:-${DOMAIN:-}}"
ACME_EMAIL="${2:-${ACME_EMAIL:-}}"

if [ -z "$DOMAIN" ]; then
  echo "Usage: bash scripts/enable-china-hk-domain.sh <domain> [acme-email]"
  exit 1
fi

cd "$PROJECT_DIR"

mkdir -p deploy/china-hk deploy/china-hk/caddy-data deploy/china-hk/caddy-config

cat > deploy/china-hk/domain.env <<EOF
DOMAIN=$DOMAIN
ACME_EMAIL=$ACME_EMAIL
PUBLIC_PORT=127.0.0.1:4000
EOF

cp config/china-hk/Caddyfile.template deploy/china-hk/Caddyfile

echo "[1/3] Domain env written to deploy/china-hk/domain.env"
echo "[2/3] Caddyfile prepared"

docker compose \
  -f docker-compose.china-hk.yml \
  -f docker-compose.china-hk-domain.yml \
  --env-file deploy/china-hk/runtime.env \
  --env-file deploy/china-hk/domain.env \
  up -d --build

echo "[3/3] Domain gateway is running"
echo
echo "Open:"
echo "  https://$DOMAIN"
echo
echo "If DNS has not fully taken effect yet, wait a few minutes and retry."
