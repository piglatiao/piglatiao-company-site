#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> 准备环境"

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp ".env.example" ".env"
    echo "已从 .env.example 生成 .env，请按需检查数据库连接配置。"
  else
    echo "未找到 .env 或 .env.example，无法继续部署。" >&2
    exit 1
  fi
fi

echo "==> 安装依赖"
pnpm install

echo "==> 创建数据库"
node ./scripts/ensure-database.mjs

echo "==> 生成 Prisma Client"
pnpm --filter @noteapp/database exec prisma generate

echo "==> 执行数据库迁移"
pnpm --filter @noteapp/database exec prisma migrate deploy

echo "==> 写入种子数据"
pnpm db:seed

echo "==> 应用版权与联系方式"
pnpm db:brand

echo "==> 构建项目"
pnpm build

mkdir -p logs

echo "==> 启动后端服务"
nohup node packages/server/dist/app.js > logs/server.log 2>&1 &
SERVER_PID=$!

echo "==> 启动前端预览服务"
nohup pnpm --filter @noteapp/web exec vite preview --host 0.0.0.0 --port 5173 > logs/web.log 2>&1 &
WEB_PID=$!

echo
echo "部署完成。"
echo "前端地址: http://localhost:5173"
echo "后端地址: http://localhost:3000"
echo "后端 PID: $SERVER_PID"
echo "前端 PID: $WEB_PID"
echo "日志目录: $ROOT_DIR/logs"
