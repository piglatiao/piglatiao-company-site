# NoteApp 公司网站

> 现代简约风公司网站 — 前端展示 + 后台管理系统

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + Vite 6 + TypeScript |
| 样式 | Tailwind CSS 3（自定义设计系统） |
| 状态管理 | TanStack Query v5 |
| 路由 | React Router v6（懒加载 + 代码分割） |
| 后端 | Node.js + Express + TypeScript |
| ORM | Prisma 6 |
| 数据库 | MySQL 8.0 |
| 认证 | JWT（access + refresh token） |
| 包管理 | pnpm 10（monorepo workspace） |

## 项目结构

```
noteapp/
├── packages/
│   ├── shared/          # 前后端共享（类型、Zod校验、常量）
│   ├── database/        # Prisma + MySQL（schema、迁移、种子）
│   ├── server/          # Express API 服务
│   │   └── src/
│   │       ├── config/      # 环境配置
│   │       ├── utils/       # JWT、密码哈希、响应工具
│   │       ├── middleware/   # 认证、错误处理、校验
│   │       ├── services/    # 业务逻辑层
│   │       ├── controllers/ # 控制器层
│   │       ├── routes/      # 路由定义
│   │       └── app.ts       # Express 应用入口
│   └── web/             # React 前端应用
│       └── src/
│           ├── components/  # 布局组件（Header、Footer、AdminLayout）
│           ├── pages/       # 公开页面 + 管理页面
│           ├── context/     # AuthContext
│           ├── lib/         # API 客户端
│           └── admin/       # 路由守卫
├── .env                 # 环境变量
├── pnpm-workspace.yaml  # monorepo 配置
└── tsconfig.base.json   # 共享 TypeScript 配置
```

## 快速开始

### 1. 环境要求

- Node.js 20+
- pnpm 10+
- MySQL 8.0+

### 2. 安装依赖

```bash
cd E:\demo\noteapp
pnpm install
```

### 3. 配置环境变量

编辑 `.env` 文件：

```env
DATABASE_URL="mysql://root:root@localhost:3306/noteapp"
JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

### 4. 初始化数据库

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS noteapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 执行迁移
pnpm db:migrate

# 写入种子数据
pnpm db:seed
```

### 5. 启动开发服务器

```bash
# 同时启动前端和后端
pnpm dev

# 或分别启动
pnpm --filter server dev   # 后端 http://localhost:3000
pnpm --filter web dev      # 前端 http://localhost:5173
```

## 生产构建

```bash
# 编译 shared 包
pnpm --filter shared build

# 编译后端
pnpm --filter server build

# 构建前端
pnpm --filter web build

# 启动生产服务器
cd packages/server
NODE_ENV=production npx tsx src/app.ts

# 预览前端构建
cd packages/web
npx vite preview
```

## API 文档

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/public/company | 公司信息 |
| GET | /api/public/products | 产品列表 |
| GET | /api/public/products/:id | 产品详情 |
| GET | /api/public/articles | 新闻列表 |
| GET | /api/public/articles/:id | 新闻详情 |
| POST | /api/public/contact | 提交留言 |

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 登录 |
| POST | /api/auth/refresh | 刷新 token |
| GET | /api/auth/me | 当前用户（需认证） |

### 管理接口（需 JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/PUT | /api/admin/company | 公司信息管理 |
| CRUD | /api/admin/products | 产品管理 |
| CRUD | /api/admin/articles | 新闻管理 |
| GET/PUT/DELETE | /api/admin/contacts | 留言管理 |
| CRUD | /api/admin/admins | 管理员管理（SUPER_ADMIN） |
| GET/PUT | /api/admin/settings | 系统设置 |

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 超级管理员 | admin | admin123 |
| 编辑 | editor | editor123 |

## 安全特性

- JWT 认证（access 15min + refresh 7d）
- bcrypt 密码哈希（12 rounds）
- Zod 输入校验（所有 API 入参）
- Helmet 安全头
- CORS 白名单
- 速率限制（登录 5次/分钟，全局 300次/15分钟）
- RBAC 角色权限控制（SUPER_ADMIN / ADMIN / EDITOR）
- Prisma 参数化查询（防 SQL 注入）

## 开发命令

```bash
pnpm dev          # 同时启动前后端开发服务器
pnpm build        # 构建所有包
pnpm db:migrate   # 执行数据库迁移
pnpm db:seed      # 写入种子数据
pnpm db:studio    # 打开 Prisma Studio
pnpm db:push      # 同步 schema 到数据库
```

## 设计说明

前端采用**现代简约风**设计：

- 字体：Fraunces（衬线标题）+ Plus Jakarta Sans（正文）+ Noto Sans SC（中文）
- 配色：暖白纸色 (#FAFAF7) + 深墨 (#1A1A1A) + 赤陶强调色 (#C8553D)
- 动效：交错式淡入、滚动感知导航、hover 微交互
- 纹理：subtle grain overlay 增加深度感

## 部署脚本

项目内已经提供 Windows / Linux 一键部署、启动、停止脚本。

### Windows

```powershell
.\scripts\deploy.ps1
.\scripts\start.ps1
.\scripts\stop.ps1
```

也可以通过 `pnpm` 调用：

```bash
pnpm run deploy:windows
pnpm run start:windows
pnpm run stop:windows
```

### Linux

```bash
bash ./scripts/deploy.sh
bash ./scripts/start.sh
bash ./scripts/stop.sh
```

也可以通过 `pnpm` 调用：

```bash
pnpm run deploy:linux
pnpm run start:linux
pnpm run stop:linux
```

### 脚本行为说明

- `deploy`：安装依赖、检查数据库、执行迁移、写入种子数据、应用版权和联系方式、构建并启动服务
- `start`：仅启动已经构建好的后端服务和前端预览，不会重新迁移数据库或写入种子
- `stop`：仅停止由部署脚本 / 启动脚本拉起的生产进程，不会停止本地 `pnpm dev`

### 重要提示

- `deploy` 会修改数据库中的品牌信息，并在执行前弹出确认提示
- Windows 下 `deploy.ps1`、`start.ps1`、`stop.ps1` 执行结束后默认会等待回车，方便直接双击运行时查看结果
- 如果你在自动化环境中执行，可使用 `-Force` 跳过部署确认，使用 `-NoPause` 跳过脚本结束等待

详细说明见 [docs/deploy-script-guide.md](./docs/deploy-script-guide.md)。

## License

MIT License，详见 `LICENSE`。

本项目为 vibe coding 开发，按“现状”提供，不承担任何使用、修改、部署所导致的后果，详见 `DISCLAIMER.md`。
