#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SERVER_ENTRY="$ROOT_DIR/packages/server/dist/app.js"
WEB_INDEX="$ROOT_DIR/packages/web/dist/index.html"

echo "==> 启动环境检查"

if [ ! -f "$SERVER_ENTRY" ]; then
  echo "未找到后端构建产物 packages/server/dist/app.js，请先执行一键部署或 pnpm build。" >&2
  exit 1
fi

if [ ! -f "$WEB_INDEX" ]; then
  echo "未找到前端构建产物 packages/web/dist/index.html，请先执行一键部署或 pnpm build。" >&2
  exit 1
fi

mkdir -p logs

echo "==> 停止旧的部署进程"
pkill -f "packages/server/dist/app.js" 2>/dev/null || true
pkill -f "vite preview --host 0.0.0.0 --port 5173" 2>/dev/null || true

echo "==> 启动后端服务"
nohup node packages/server/dist/app.js > logs/server.log 2>&1 &
SERVER_PID=$!

echo "==> 启动前端预览"
nohup pnpm --filter @noteapp/web exec vite preview --host 0.0.0.0 --port 5173 > logs/web.log 2>&1 &
WEB_PID=$!

echo
echo "启动完成。"
echo "前端地址: http://localhost:5173"
echo "后端地址: http://localhost:3000"
echo "后端 PID: $SERVER_PID"
echo "前端 PID: $WEB_PID"
echo "日志目录: $ROOT_DIR/logs"
