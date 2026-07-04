# 部署脚本说明

本文说明仓库内一键部署、启动、停止脚本的用途，以及它们对数据库数据的影响。

## 1. 脚本列表

### Windows

- 一键部署：`.\scripts\deploy.ps1`
- 一键启动：`.\scripts\start.ps1`
- 一键停止：`.\scripts\stop.ps1`

也可以通过 `pnpm` 调用：

- `pnpm run deploy:windows`
- `pnpm run start:windows`
- `pnpm run stop:windows`

### Linux

- 一键部署：`bash ./scripts/deploy.sh`
- 一键启动：`bash ./scripts/start.sh`
- 一键停止：`bash ./scripts/stop.sh`

也可以通过 `pnpm` 调用：

- `pnpm run deploy:linux`
- `pnpm run start:linux`
- `pnpm run stop:linux`

## 2. 一键部署会做什么

`deploy` 脚本会执行以下动作：

1. 检查 `.env`
2. 安装依赖
3. 创建并检查数据库
4. 生成 Prisma Client
5. 执行数据库迁移
6. 写入种子数据
7. 应用版权与联系方式更新
8. 构建前后端
9. 停止旧的部署进程
10. 启动后端和前端预览服务

## 3. 一键部署会不会覆盖数据

会，但不是“完全覆盖”，而是“有明确范围的更新”，请特别注意。

### 会被直接更新的数据

- `company_info.email` 会被更新为 `599594629@qq.com`
- `company_info.address` 会被更新为 `甘肃兰州`
- `company_info.wechat` 会被更新为 `jieyi5170`
- `settings.site_copyright` 会被更新为 `piglatiao`
- `settings.footer_copyright` 会被更新为 `piglatiao`

### 种子数据的行为

- 管理员账号如果不存在，会自动创建
- 产品和新闻如果按标题查不到，会自动补充演示数据
- 设置项如果不存在，会自动补充默认值
- 大部分现有设置不会被 seed 覆盖，因为 seed 对已存在记录使用的是 `update: {}`

### 当前脚本已经增加确认提示

执行 `deploy` 时会弹出确认提示，明确告知将修改哪些字段。

如果你是在自动化环境中执行，需要跳过确认：

- Windows：`.\scripts\deploy.ps1 -Force`
- Linux：`bash ./scripts/deploy.sh --yes`

## 4. 一键启动会做什么

`start` 脚本不会安装依赖，不会迁移数据库，不会写 seed，也不会改公司联系方式和版权。

它只会：

1. 检查前后端构建产物是否存在
2. 停止旧的部署进程
3. 启动后端 `packages/server/dist/app.js`
4. 启动前端 `vite preview`

适合已经部署过一次，只是重启服务的场景。

## 5. 一键停止会做什么

`stop` 脚本只会停止通过部署脚本或启动脚本启动的：

- 后端生产服务
- 前端 `vite preview`

它不会停止你本地开发时运行的 `pnpm dev`。

## 6. 脚本执行结束后是否自动关闭窗口

Windows 下的 `deploy.ps1`、`start.ps1`、`stop.ps1` 默认会在执行结束后等待你按回车，再关闭窗口，方便直接双击运行时查看结果。

如果你是在自动化环境中执行，或者不希望等待回车，可以使用：

- `.\scripts\deploy.ps1 -NoPause`
- `.\scripts\start.ps1 -NoPause`
- `.\scripts\stop.ps1 -NoPause`

## 7. 日志位置

部署或启动后，日志统一写到根目录 `logs/`：

- 后端标准输出：`logs/server.log`
- 后端错误输出：`logs/server.error.log`
- 前端标准输出：`logs/web.log`
- 前端错误输出：`logs/web.error.log`
