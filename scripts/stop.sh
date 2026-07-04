#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> 停止一键部署进程"

pkill -f "packages/server/dist/app.js" 2>/dev/null || true
pkill -f "vite preview --host 0.0.0.0 --port 5173" 2>/dev/null || true

echo "停止操作已完成。"
