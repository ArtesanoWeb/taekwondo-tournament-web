#!/usr/bin/env bash
# Starts a throwaway API for the E2E tests (`npm run e2e:api`): the backend's Docker image with
# SQLite inside the container, on its own port, so the tests never touch the development
# database. Each start is a clean database with the demo data of `npm run seed`.
#
# Usage: scripts/e2e-api.sh [backend-dir]   (default ../Backend; CI passes its checkout)
# Stop it with: docker rm -f tkd-e2e-api
set -euo pipefail

BACKEND_DIR="${1:-../Backend}"
PORT="${E2E_API_PORT:-8001}"
NAME=tkd-e2e-api

docker rm -f "$NAME" >/dev/null 2>&1 || true
echo "Construyendo la imagen del backend desde $BACKEND_DIR…"
docker build --quiet --tag "$NAME" "$BACKEND_DIR" >/dev/null
docker run --detach --rm --name "$NAME" --publish "$PORT:8000" \
  --env DATABASE_URL=sqlite:////tmp/e2e.db \
  --env SECRET_KEY=e2e-secret-key \
  --env ADMIN_USERNAME=admin \
  --env ADMIN_PASSWORD=admin \
  "$NAME" >/dev/null

# The seed waits for /health itself.
SEED_API_URL="http://localhost:$PORT" node scripts/seed.mjs
echo "API de E2E lista en http://localhost:$PORT"
