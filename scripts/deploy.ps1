$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "==> 准备环境"

if (-not (Test-Path ".env")) {
  if (Test-Path ".env.example") {
    Copy-Item ".env.example" ".env"
    Write-Host "已从 .env.example 生成 .env，请按需检查数据库连接配置。"
  } else {
    throw "未找到 .env 或 .env.example，无法继续部署。"
  }
}

Write-Host "==> 安装依赖"
pnpm install

Write-Host "==> 创建数据库"
node .\scripts\ensure-database.mjs

Write-Host "==> 生成 Prisma Client"
pnpm --filter @noteapp/database exec prisma generate

Write-Host "==> 执行数据库迁移"
pnpm --filter @noteapp/database exec prisma migrate deploy

Write-Host "==> 写入种子数据"
pnpm db:seed

Write-Host "==> 应用版权与联系方式"
pnpm db:brand

Write-Host "==> 构建项目"
pnpm build

if (-not (Test-Path "logs")) {
  New-Item -ItemType Directory -Path "logs" | Out-Null
}

Write-Host "==> 启动后端服务"
Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c", "node packages/server/dist/app.js >> logs/server.log 2>>&1" `
  -WorkingDirectory $Root `
  -WindowStyle Hidden

Write-Host "==> 启动前端预览服务"
Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c", "pnpm --filter @noteapp/web exec vite preview --host 0.0.0.0 --port 5173 >> logs/web.log 2>>&1" `
  -WorkingDirectory $Root `
  -WindowStyle Hidden

Write-Host ""
Write-Host "部署完成。"
Write-Host "前端地址: http://localhost:5173"
Write-Host "后端地址: http://localhost:3000"
Write-Host "日志目录: $Root\\logs"
