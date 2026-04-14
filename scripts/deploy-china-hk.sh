#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/henghesha-agent-marketplace}"
REPO_URL="${REPO_URL:-https://github.com/weiliangal/henghesha-agent-marketplace.git}"
RUNTIME_ENV="$PROJECT_DIR/deploy/china-hk/runtime.env"
DEFAULT_BRANCH="${DEFAULT_BRANCH:-main}"

echo "[1/6] Checking dependencies..."
if ! command -v git >/dev/null 2>&1; then
  apt-get update
  apt-get install -y git
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Please install Docker first or use the Docker CE image."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is required but not found."
  exit 1
fi

echo "[2/6] Syncing repository..."
mkdir -p "$(dirname "$PROJECT_DIR")"
if [ -d "$PROJECT_DIR/.git" ]; then
  git -C "$PROJECT_DIR" fetch origin "$DEFAULT_BRANCH"
  git -C "$PROJECT_DIR" checkout "$DEFAULT_BRANCH"
  git -C "$PROJECT_DIR" pull --ff-only origin "$DEFAULT_BRANCH"
else
  git clone "$REPO_URL" "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"

echo "[3/6] Preparing persistent directories..."
mkdir -p deploy/china-hk/data deploy/china-hk/uploads

if [ ! -f "$RUNTIME_ENV" ]; then
  if command -v openssl >/dev/null 2>&1; then
    JWT_SECRET_VALUE="$(openssl rand -hex 32)"
  else
    JWT_SECRET_VALUE="$(dd if=/dev/urandom bs=32 count=1 2>/dev/null | base64 | tr -d '\n' | tr '/+' 'AZ' | cut -c1-48)"
  fi
  cat >"$RUNTIME_ENV" <<EOF
PUBLIC_PORT=80
CLIENT_ORIGIN=
JWT_SECRET=$JWT_SECRET_VALUE
DATABASE_PATH=./data/marketplace.sqlite
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.2
EOF
  echo "[4/6] Created runtime env at $RUNTIME_ENV"
  echo "      If you have a real OpenAI API key, edit this file later."
else
  echo "[4/6] Reusing existing runtime env at $RUNTIME_ENV"
fi

echo "[5/6] Building and starting containers..."
docker compose -f docker-compose.china-hk.yml --env-file "$RUNTIME_ENV" up -d --build

PUBLIC_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
if command -v curl >/dev/null 2>&1; then
  CURL_IP="$(curl -fsS ifconfig.me 2>/dev/null || true)"
  if [ -n "$CURL_IP" ]; then
    PUBLIC_IP="$CURL_IP"
  fi
fi

echo "[6/6] Done."
echo
echo "Open the site at: http://${PUBLIC_IP}"
echo "Health check: http://${PUBLIC_IP}/api/health"
