# 恒河沙智能体交易网

恒河沙智能体交易网是一个连接高校与企业的智能体展示、交易、需求撮合和交付管理平台。它作为独立子系统放在仓库 `apps/` 目录下，不会改动短剧镜头流水线的 manifest、状态机和模块边界。

## 项目结构

```text
apps/
  marketplace-web/        # React + TailwindCSS 前端
  marketplace-api/        # Node.js + Express 后端
docs/
  henghesha-platform.md   # 平台说明
  api-reference.md        # API 文档
  deploy-vercel-railway.md
scripts/
  install-marketplace.cmd
  start-marketplace.cmd
  verify-marketplace.cmd
```

## 前端说明

前端位于 `apps/marketplace-web`，使用 React、TailwindCSS、React Router 和 Axios。

主要页面：

- `/` 首页：品牌首屏、推荐智能体、模板中心入口、案例入口、分类筛选。
- `/agents` 智能体库：支持搜索、分类筛选、价格区间筛选、分页浏览。
- `/agents/:id` 智能体详情：展示轮播图、案例图、价格、功能描述、购买入口。
- `/templates` 模板中心：企业可直接选择模板并跳转下单页。
- `/cases` 成功案例页：展示应用场景和匹配模板。
- `/auth` 登录注册页：邮箱、密码、角色选择。
- `/enterprise/orders/new` 企业发布需求页：支持预算、交付时间、附件上传。
- `/school/upload` 学校上传页：支持上传智能体图片、文件和 AI 草案生成。
- `/orders` 订单页：企业、学校、管理员按权限查看各自订单。
- `/profile` 用户中心：个人资料、安全设置、通知列表。
- `/admin` 管理后台：审核智能体、订单、支付状态和用户状态。

前端公共能力：

- `AuthContext` 负责 JWT 持久化和登录态管理。
- `ProtectedRoute` 对学校、企业、管理员页面做权限拦截。
- `src/api/client.js` 统一封装 Axios、自动带 Token、自动拼接 API 地址。
- `SmartImage` 和媒体路径解析逻辑支持从前端直接访问后端上传图片。

## 后端说明

后端位于 `apps/marketplace-api`，使用 Node.js、Express 和 JWT。

主要能力：

- 用户认证：注册、登录、读取当前用户信息。
- 智能体管理：查询、上传、编辑、删除、管理员审核。
- 订单交易：企业下单、学校交付、管理员审核支付和状态。
- 通知系统：订单创建、审核流转时自动写入通知。
- OpenAI 生成：根据需求描述生成智能体草案。
- 文件上传：支持图片、附件、交付文件上传到本地 `uploads/`。

默认数据库：

- 当前默认使用 SQLite。
- 数据库文件路径：`apps/marketplace-api/data/marketplace.sqlite`
- 依赖 Node 22+ 自带的 `node:sqlite`。

可替换数据库：

- 已提供 PostgreSQL / Supabase schema。
- 迁移时可用 `apps/marketplace-api/sql/schema.postgres.sql` 和 `apps/marketplace-api/sql/seed.postgres.sql`。

## 用户角色

- 访客：可浏览首页、智能体库、详情页、模板页、案例页。
- 学校用户：可上传、编辑、删除自己的智能体，查看订单并进行交付。
- 企业用户：可选择模板、购买智能体、发布需求订单、提交支付回执。
- 管理员：可审核智能体、审核订单、管理用户、禁用账号。

## API 概览

认证：

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/profile`

用户中心：

- `GET /api/users/me`
- `PATCH /api/users/me`
- `PATCH /api/users/me/password`

智能体：

- `GET /api/agents`
- `GET /api/agents/:id`
- `POST /api/agents`
- `PATCH /api/agents/:id`
- `DELETE /api/agents/:id`

订单：

- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id`
- `DELETE /api/orders/:id`

管理员：

- `GET /api/admin/stats`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/agents`
- `PATCH /api/admin/agents/:id`
- `PATCH /api/admin/agents/:id/status`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id/status`
- `GET /api/admin/audit-logs`

站点数据：

- `GET /api/site/overview`
- `GET /api/site/templates`

通知：

- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`

OpenAI：

- `POST /api/openai/generate`

完整接口说明见 [api-reference.md](C:/Users/william/Documents/New%20project/docs/api-reference.md)。

## 数据库结构

核心表：

- `users`
- `agents`
- `orders`
- `payments`
- `audit_logs`
- `notifications`

脚本文件：

- SQLite schema: [schema.sqlite.sql](C:/Users/william/Documents/New%20project/apps/marketplace-api/sql/schema.sqlite.sql)
- SQLite seed: [seed.sqlite.sql](C:/Users/william/Documents/New%20project/apps/marketplace-api/sql/seed.sqlite.sql)
- PostgreSQL schema: [schema.postgres.sql](C:/Users/william/Documents/New%20project/apps/marketplace-api/sql/schema.postgres.sql)
- PostgreSQL seed: [seed.postgres.sql](C:/Users/william/Documents/New%20project/apps/marketplace-api/sql/seed.postgres.sql)

## 示例账户

- 管理员：`admin@henghesha.com / password123`
- 学校：`school@example.com / password123`
- 企业：`enterprise@example.com / password123`

## 环境变量

前端：

- `VITE_API_BASE_URL`

后端：

- `PORT`
- `CLIENT_ORIGIN`
- `JWT_SECRET`
- `DATABASE_PATH`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

示例文件：

- [前端 .env.example](C:/Users/william/Documents/New%20project/apps/marketplace-web/.env.example)
- [后端 .env.example](C:/Users/william/Documents/New%20project/apps/marketplace-api/.env.example)

## 本地运行

后端：

```bash
cd apps/marketplace-api
npm.cmd install
npm.cmd run dev
```

前端：

```bash
cd apps/marketplace-web
npm.cmd install
npm.cmd run dev
```

根目录快捷方式：

```bat
scripts\install-marketplace.cmd
scripts\start-marketplace.cmd
scripts\verify-marketplace.cmd
```

## 验收方式

推荐在仓库根目录执行：

```bat
npm.cmd run verify:marketplace
```

这会完成：

- 后端 smoke test
- 前端生产构建

如果需要生成页面预览图，可执行：

```bat
npm.cmd run screenshots:web
```

## 部署说明

部署文档见 [deploy-vercel-railway.md](C:/Users/william/Documents/New%20project/docs/deploy-vercel-railway.md)。
