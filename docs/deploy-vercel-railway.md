# 恒河沙智能体交易网部署说明

本文档说明如何将前端部署到 Vercel，将后端部署到 Railway，并说明如何切换到 Supabase / PostgreSQL。

## 前端部署到 Vercel

前端目录：

`apps/marketplace-web`

部署步骤：

1. 在 Vercel 创建新项目并连接当前仓库。
2. Root Directory 选择 `apps/marketplace-web`。
3. Build Command 使用 `npm run build`。
4. Output Directory 使用 `dist`。
5. 设置环境变量：

```env
VITE_API_BASE_URL=https://你的后端域名/api
```

6. 点击部署。
7. 部署完成后，记录 Vercel 生成的前端域名。

说明：

- 前端目录已内置 [vercel.json](C:/Users/william/Documents/New%20project/apps/marketplace-web/vercel.json)，支持 SPA 路由回退。
- 如果后端域名变更，只需要修改 `VITE_API_BASE_URL` 并重新部署。

## 后端部署到 Railway

后端目录：

`apps/marketplace-api`

部署步骤：

1. 在 Railway 创建新项目并连接当前仓库。
2. Root Directory 选择 `apps/marketplace-api`。
3. Railway 会自动识别 [railway.toml](C:/Users/william/Documents/New%20project/apps/marketplace-api/railway.toml)。
4. 设置环境变量：

```env
PORT=4000
CLIENT_ORIGIN=https://你的-vercel-域名.vercel.app
JWT_SECRET=请替换成高强度随机密钥
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.2
DATABASE_PATH=./data/marketplace.sqlite
```

5. 点击部署。
6. 部署完成后，记录 Railway 提供的后端域名。

说明：

- 也可以兼容使用 [Procfile](C:/Users/william/Documents/New%20project/apps/marketplace-api/Procfile) 部署到 Heroku。
- Node 版本建议 22 及以上。

## Railway 上的数据持久化建议

当前默认数据库是 SQLite，适合本地演示和快速试跑。

如果要正式上线，建议改用 PostgreSQL / Supabase，原因是：

- Railway 重启或重新部署后，本地磁盘型 SQLite 不适合作为长期持久化方案。
- PostgreSQL 更适合多用户订单、支付审核和后台管理场景。

## 切换到 Supabase / PostgreSQL

1. 在 Supabase 新建项目。
2. 在 SQL Editor 中执行：

- [schema.postgres.sql](C:/Users/william/Documents/New%20project/apps/marketplace-api/sql/schema.postgres.sql)
- [seed.postgres.sql](C:/Users/william/Documents/New%20project/apps/marketplace-api/sql/seed.postgres.sql)

3. 在后端平台配置环境变量：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://...
```

4. 将后端数据库访问层从 SQLite 替换为 `pg` 或 `@supabase/supabase-js`。

当前 schema 已经兼容 PostgreSQL，只需要替换查询实现。

## 本地先验收再部署

后端：

```bat
cd apps\marketplace-api
npm.cmd install
npm.cmd run dev
```

前端：

```bat
cd apps\marketplace-web
npm.cmd install
npm.cmd run dev
```

一键方式：

```bat
scripts\install-marketplace.cmd
scripts\start-marketplace.cmd
```

## 部署前本地验收

建议在仓库根目录执行：

```bat
npm.cmd run verify:marketplace
```

这会完成：

- 后端 smoke test，确认登录、智能体查询、订单创建和支付提交流程正常。
- 前端生产构建，确认打包产物可生成。

如需生成演示截图，可执行：

```bat
npm.cmd run screenshots:web
```

## 部署后检查清单

- 前端首页是否能正常加载推荐智能体。
- `/agents` 和 `/templates` 是否能正常请求后端。
- 注册、登录和 JWT 鉴权是否生效。
- 企业用户是否能正常创建订单。
- 学校用户是否能正常上传智能体。
- 管理员是否能在后台审核智能体、订单和用户状态。
- `OPENAI_API_KEY` 未配置时，`/api/openai/generate` 是否仍返回 mock 结果。
