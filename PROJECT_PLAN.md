# NoteApp 公司网站项目规划

> 基于已安装技能：frontend-design、backend-architect、senior-fullstack、fullstack-dev  
> 环境确认：Node.js v20.20.2 | npm 10.8.2 | MySQL（本机）  
> 项目路径：`E:\demo\noteapp`

---

## 一、技术栈选型

### 前端（公开展示 + 后台管理）

| 领域 | 选型 | 理由 |
|------|------|------|
| 框架 | React 18 + Vite | 构建快、HMR、生态成熟（senior-fullstack 技能推荐） |
| 语言 | TypeScript | 类型安全，fullstack-dev 技能强调 SOLID 原则 |
| 样式 | Tailwind CSS + shadcn/ui | 原子化 CSS + 可定制组件库 |
| 状态管理 | Zustand（全局）+ TanStack Query（服务端状态） | 轻量、组合式 |
| 路由 | React Router v6 | 成熟稳定 |
| 动效 | Motion（Framer Motion） | frontend-design 技能推荐用于 React 交互动效 |
| 图表 | Recharts | 后台数据可视化（fullstack-dev 技能推荐） |

### 后端（API 服务）

| 领域 | 选型 | 理由 |
|------|------|------|
| 运行时 | Node.js 20+ | 已确认本机可用 |
| 框架 | Express + TypeScript | 轻量灵活，backend-architect 技能推荐 |
| ORM | Prisma | 类型安全、迁移管理、MySQL 支持好 |
| 认证 | JWT（access + refresh token） | 无状态、可扩展 |
| 密码 | bcrypt（12 rounds） | fullstack-dev 安全规范 |
| 验证 | Zod | 前后端共享类型校验 |
| 日志 | Pino | 高性能结构化日志 |
| API 文档 | Swagger（自动生成） | backend-architect 技能强调 API 契约 |

### 数据库

| 领域 | 选型 |
|------|------|
| 数据库 | MySQL（本机已有） |
| 连接方式 | Prisma + 连接池 |
| 迁移策略 | Prisma Migrate（版本化迁移） |

### 工程化

| 领域 | 选型 |
|------|------|
| 代码规范 | ESLint + Prettier + TypeScript 严格模式 |
| 测试 | Vitest（单元）+ Supertest（API 集成）+ Playwright（E2E） |
| 包管理 | pnpm（monorepo 友好） |
| Git | Conventional Commits 规范 |

---

## 二、项目架构（Clean Architecture + Monorepo）

```
E:\demo\noteapp\
├── package.json                    # 根工作区配置
├── pnpm-workspace.yaml             # monorepo 工作区
├── .env.example                    # 环境变量模板
├── .gitignore
├── README.md
│
├── packages/
│   ├── shared/                     # 前后端共享代码
│   │   ├── src/
│   │   │   ├── types/              # 共享类型定义
│   │   │   ├── constants/          # 共享常量
│   │   │   ├── validators/         # Zod 校验 schema
│   │   │   └── utils/              # 通用工具函数
│   │   └── package.json
│   │
│   ├── database/                   # 数据库层（Prisma）
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # 数据模型定义
│   │   │   ├── migrations/         # 迁移文件
│   │   │   └── seed.ts             # 种子数据
│   │   ├── src/
│   │   │   └── client.ts           # Prisma 客户端单例
│   │   └── package.json
│   │
│   ├── server/                     # 后端 API 服务
│   │   ├── src/
│   │   │   ├── domain/             # 领域层：实体、值对象
│   │   │   │   ├── entities/
│   │   │   │   └── value-objects/
│   │   │   ├── application/        # 应用层：用例、服务、DTO
│   │   │   │   ├── services/
│   │   │   │   ├── use-cases/
│   │   │   │   └── dto/
│   │   │   ├── infrastructure/     # 基础设施层
│   │   │   │   ├── repositories/   # 仓储实现
│   │   │   │   ├── auth/           # JWT、密码哈希
│   │   │   │   ├── middleware/      # Express 中间件
│   │   │   │   └── config/         # 配置管理
│   │   │   ├── presentation/       # 表现层：路由、控制器
│   │   │   │   ├── routes/
│   │   │   │   ├── controllers/
│   │   │   │   └── swagger/        # API 文档配置
│   │   │   └── app.ts              # Express 应用入口
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   └── integration/
│   │   └── package.json
│   │
│   └── web/                        # 前端应用
│       ├── public/
│       ├── src/
│       │   ├── app/                # 应用入口、路由配置
│       │   ├── pages/              # 页面组件
│       │   │   ├── public/         # 公开展示页面
│       │   │   │   ├── Home.tsx        # 首页
│       │   │   │   ├── About.tsx       # 关于我们
│       │   │   │   ├── Products.tsx    # 产品/服务
│       │   │   │   ├── News.tsx        # 新闻动态
│       │   │   │   ├── NewsDetail.tsx  # 新闻详情
│       │   │   │   ├── Contact.tsx     # 联系我们
│       │   │   │   └── NotFound.tsx    # 404 页面
│       │   │   └── admin/          # 后台管理页面
│       │   │       ├── Dashboard.tsx     # 控制台
│       │   │       ├── Login.tsx         # 管理员登录
│       │   │       ├── ContentManage.tsx # 内容管理（新闻/产品）
│       │   │       ├── UserManage.tsx    # 用户管理
│       │   │       ├── Settings.tsx      # 系统设置
│       │   │       └── Profile.tsx       # 个人中心
│       │   ├── components/         # 可复用组件
│       │   │   ├── ui/             # 基础 UI 组件（shadcn/ui）
│       │   │   ├── layout/         # 布局组件
│       │   │   │   ├── PublicHeader.tsx
│       │   │   │   ├── PublicFooter.tsx
│       │   │   │   ├── AdminSidebar.tsx
│       │   │   │   └── AdminLayout.tsx
│       │   │   └── shared/         # 业务组件
│       │   ├── hooks/              # 自定义 Hooks
│       │   ├── lib/                # 工具库、API 客户端
│       │   │   ├── api.ts          # API 请求封装
│       │   │   └── auth.ts         # 前端鉴权逻辑
│       │   ├── stores/             # Zustand 状态
│       │   ├── styles/             # 全局样式
│       │   └── types/              # 前端类型
│       ├── tests/
│       │   └── e2e/                # Playwright E2E 测试
│       └── package.json
```

---

## 三、数据库设计

### 核心数据模型

```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// 管理员用户
model Admin {
  id        Int      @id @default(autoincrement())
  username  String   @unique @db.VarChar(50)
  email     String   @unique @db.VarChar(100)
  password  String   @db.VarChar(255)    // bcrypt 哈希
  role      Role     @default(EDITOR)    // SUPER_ADMIN / ADMIN / EDITOR
  avatar    String?  @db.VarChar(255)
  status    Int      @default(1)         // 1=启用 0=禁用
  lastLogin DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("admins")
}

// 公司信息（单行配置表）
model CompanyInfo {
  id          Int     @id @default(1)
  name        String  @db.VarChar(100)
  logo        String? @db.VarChar(255)
  description Text?
  address     String? @db.VarChar(255)
  phone       String? @db.VarChar(50)
  email       String? @db.VarChar(100)
  wechat      String? @db.VarChar(100)
  aboutUs     Text?                        // 关于我们
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("company_info")
}

// 产品/服务
model Product {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(200)
  summary     String?  @db.VarChar(500)
  content     Text
  coverImage  String?  @db.VarChar(255)
  category    String?  @db.VarChar(50)
  sort        Int      @default(0)        // 排序权重
  status      Int      @default(1)         // 1=上架 0=下架
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("products")
}

// 新闻动态
model Article {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(200)
  summary     String?  @db.VarChar(500)
  content     Text
  coverImage  String?  @db.VarChar(255)
  category    String?  @db.VarChar(50)    // 公司新闻 / 行业资讯
  viewCount   Int      @default(0)
  isTop       Boolean  @default(false)    // 是否置顶
  status      Int      @default(1)         // 1=发布 0=草稿
  authorId    Int?
  author      Admin?   @relation(fields: [authorId], references: [id])
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("articles")
}

// 联系留言
model Contact {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(50)
  email     String?  @db.VarChar(100)
  phone     String?  @db.VarChar(50)
  company   String?  @db.VarChar(100)
  message   Text
  status    Int      @default(0)          // 0=未处理 1=已处理
  reply     String?  @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("contacts")
}

// 系统设置（键值对）
model Setting {
  key       String   @id @db.VarChar(50)
  value     String   @db.Text
  updatedAt DateTime @updatedAt

  @@map("settings")
}

enum Role {
  SUPER_ADMIN
  ADMIN
  EDITOR
}
```

---

## 四、API 设计

### 公开 API（无需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/public/company` | 获取公司信息 |
| GET | `/api/public/products` | 产品列表（分页） |
| GET | `/api/public/products/:id` | 产品详情 |
| GET | `/api/public/articles` | 新闻列表（分页） |
| GET | `/api/public/articles/:id` | 新闻详情 |
| POST | `/api/public/contact` | 提交联系留言 |

### 管理后台 API（需 JWT 认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 管理员登录 |
| POST | `/api/auth/refresh` | 刷新 token |
| POST | `/api/auth/logout` | 退出登录 |
| GET | `/api/auth/me` | 获取当前用户信息 |
| GET/PUT | `/api/admin/company` | 获取/更新公司信息 |
| GET/POST/PUT/DELETE | `/api/admin/products` | 产品 CRUD |
| GET/POST/PUT/DELETE | `/api/admin/articles` | 新闻 CRUD |
| GET/PUT/DELETE | `/api/admin/contacts` | 留言管理 |
| GET/PUT | `/api/admin/settings` | 系统设置 |
| GET/POST/PUT/DELETE | `/api/admin/users` | 管理员用户管理 |

### 统一响应格式

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
}
```

### 安全策略（backend-architect + fullstack-dev 技能）

- JWT access token（15 分钟过期）+ refresh token（7 天）
- bcrypt 密码哈希（12 rounds）
- Zod 输入校验（所有 API 入参）
- 速率限制（express-rate-limit：登录接口 5 次/分钟）
- CORS 白名单配置
- Helmet 安全头
- SQL 注入防护（Prisma 参数化查询）
- RBAC 角色权限控制

---

## 五、前端页面规划

### 公开展示页面（frontend-design 技能指导）

遵循 frontend-design 技能的设计理念：选择一个大胆的美学方向，避免通用 AI 美学，使用独特的字体和配色系统。

| 页面 | 核心内容 | 设计要点 |
|------|---------|---------|
| 首页 | Hero 区、公司简介、核心产品、最新新闻、CTA | 滚动触发动效、交错式布局 |
| 关于我们 | 公司介绍、团队、发展历程、企业文化 | 编辑式排版、大气留白 |
| 产品/服务 | 产品列表、分类筛选、详情页 | 卡片网格、hover 微交互 |
| 新闻动态 | 新闻列表、分类、详情页 | 杂志式布局、阅读体验优化 |
| 联系我们 | 联系表单、地图、联系方式 | 表单验证、提交反馈动效 |

### 后台管理页面（admin panel）

| 页面 | 功能 |
|------|------|
| 登录页 | 管理员登录表单 |
| 控制台 | 数据概览（新闻数、留言数、访问统计）、最近活动 |
| 内容管理 | 新闻/产品的增删改查、富文本编辑器 |
| 留言管理 | 留言列表、状态标记、回复 |
| 用户管理 | 管理员账号管理、角色分配 |
| 系统设置 | 公司信息编辑、系统参数配置 |

---

## 六、开发阶段与任务分解

### 阶段一：项目初始化与基础设施（1-2 天）

1. 初始化 monorepo 结构（pnpm workspace）
2. 配置 ESLint + Prettier + TypeScript 严格模式
3. 搭建 `packages/shared` 共享类型和校验
4. 搭建 `packages/database` Prisma 配置
5. 编写 `schema.prisma` 数据模型
6. 执行 Prisma 迁移生成数据库表
7. 编写种子数据脚本（初始管理员账号）

### 阶段二：后端 API 开发（3-4 天）

1. 搭建 Express + TypeScript 服务框架
2. 实现 Clean Architecture 分层结构
3. 配置中间件（CORS、Helmet、日志、限流、错误处理）
4. 实现认证模块（登录、JWT 签发/验证、密码哈希）
5. 实现公开 API（公司信息、产品列表、新闻列表、留言提交）
6. 实现管理 API（CRUD 操作、权限控制）
7. 配置 Swagger API 文档自动生成
8. 编写单元测试和集成测试

### 阶段三：前端公开展示页面（3-4 天）

1. 初始化 Vite + React + TypeScript 项目
2. 配置 Tailwind CSS + shadcn/ui
3. 确定 frontend-design 美学方向（配色、字体、动效风格）
4. 实现公开布局（Header、Footer、导航）
5. 实现首页（Hero、产品精选、新闻预览）
6. 实现关于我们页面
7. 实现产品列表和详情页
8. 实现新闻列表和详情页
9. 实现联系我们页面（含表单验证和提交）
10. 响应式适配（移动端/平板/桌面）

### 阶段四：后台管理系统（3-4 天）

1. 实现管理后台布局（Sidebar + 顶栏）
2. 实现登录页面和鉴权流程
3. 实现控制台数据概览（Recharts 图表）
4. 实现内容管理（新闻/产品 CRUD + 富文本编辑器）
5. 实现留言管理
6. 实现用户管理
7. 实现系统设置页面

### 阶段五：测试与优化（2 天）

1. 编写 E2E 测试（Playwright）
2. 安全审查（npm audit、输入校验、权限验证）
3. 性能优化（代码分割、懒加载、缓存策略）
4. 构建 production 产物
5. 编写部署文档

---

## 七、环境变量配置

```env
# .env.example

# Database
DATABASE_URL="mysql://root:your_password@localhost:3306/noteapp"

# JWT
JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# Frontend
VITE_API_BASE_URL="http://localhost:3000/api"

# CORS
CORS_ORIGIN="http://localhost:5173"
```

---

## 八、后续行动

1. **授权目录访问**：在 QoderWork 中将 `E:\demo\noteapp` 添加为工作目录，我就可以直接在那里创建项目文件了。
2. **确认 MySQL 连接信息**：数据库名、用户名、密码、端口（默认 3306）。
3. **确认设计方向**：你希望公司网站是什么样的风格？（例如：现代科技感、稳重商务风、活泼创意风等）
4. **开始执行阶段一**：目录授权后，我会立即开始初始化项目结构。

---

> 本规划文档由 4 个已安装技能的指南综合生成：
> - **frontend-design**：前端美学方向、避免通用设计
> - **backend-architect**：API 契约设计、安全模式、弹性策略
> - **senior-fullstack**：全栈脚手架、技术栈指导
> - **fullstack-dev**：Clean Architecture、TDD、安全与 DevOps 实践
