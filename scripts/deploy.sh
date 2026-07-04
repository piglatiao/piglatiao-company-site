#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

FORCE_DEPLOY=0
if [[ "${1:-}" == "--yes" ]]; then
  FORCE_DEPLOY=1
fi

confirm_deploy_action() {
  if [[ "$FORCE_DEPLOY" -eq 1 ]]; then
    return
  fi

  echo
  echo "==> 部署前确认"
  echo "该脚本将执行数据库迁移、写入种子数据、应用版权与联系方式更新。"
  echo "其中以下数据会被直接更新："
  echo "1. 公司邮箱 -> 599594629@qq.com"
  echo "2. 公司地址 -> 甘肃兰州"
  echo "3. 公司微信 -> jieyi5170"
  echo "4. site_copyright / footer_copyright -> piglatiao"
  echo
  read -r -p "确认继续部署吗？输入 Y 继续，其他任意内容取消: " answer
  if [[ "$answer" != "Y" && "$answer" != "y" ]]; then
    echo "已取消部署。"
    exit 1
  fi
}

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

set -a
# shellcheck disable=SC1091
. ./.env
set +a

confirm_deploy_action

echo "==> 安装依赖"
pnpm install

echo "==> 创建并检查数据库"
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
echo "部署完成。"
echo "前端地址: http://localhost:5173"
echo "后端地址: http://localhost:3000"
echo "后端 PID: $SERVER_PID"
echo "前端 PID: $WEB_PID"
echo "日志目录: $ROOT_DIR/logs"
