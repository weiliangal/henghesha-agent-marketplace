# Short Drama Localization Pipeline

This repository remains a shot-level localization and remaster pipeline for short drama production.
It is not an episode-level one-click generator, and the original manifest/state-machine contract remains unchanged.

## Pipeline Scope

- `src/ingest`: source probing, shot splitting, thumbnails and initial manifests
- `src/localize`: dialogue localization
- `src/classify`: shot classification and routing
- `src/runway`: remote generation orchestration
- `src/qc`: review and rejection logic
- `src/compose`: conform and export

Core rules and handoff boundaries are documented in [AGENTS.md](C:/Users/william/Documents/New%20project/AGENTS.md).

## Additional App: 恒河沙智能体交易网

This repository also includes a standalone marketplace application for AI agent trading.
It is fully isolated under `apps/` and does not modify the shot pipeline contract.

- Frontend: [apps/marketplace-web](C:/Users/william/Documents/New%20project/apps/marketplace-web)
- Backend: [apps/marketplace-api](C:/Users/william/Documents/New%20project/apps/marketplace-api)
- Full platform docs: [docs/henghesha-platform.md](C:/Users/william/Documents/New%20project/docs/henghesha-platform.md)
- API reference: [docs/api-reference.md](C:/Users/william/Documents/New%20project/docs/api-reference.md)
- Deployment guide: [docs/deploy-vercel-railway.md](C:/Users/william/Documents/New%20project/docs/deploy-vercel-railway.md)
- China display deployment: [docs/deploy-china-hk.md](C:/Users/william/Documents/New%20project/docs/deploy-china-hk.md)

## Marketplace Tech Stack

- Frontend: React + TailwindCSS + React Router + Axios
- Backend: Node.js + Express + JWT
- Database: SQLite by default, PostgreSQL / Supabase schema included
- AI: OpenAI Responses API with mock fallback when `OPENAI_API_KEY` is absent
- Payment: manual confirmation workflow

## Marketplace Features

- Visitors can browse the homepage, agent library, templates and case pages
- School users can upload, edit and manage their own agents
- Enterprise users can browse agents, choose templates and submit demand orders
- Admin users can review users, agents, orders and payment states
- Notifications, audit logs, manual payment confirmation and attachment upload are included

## Marketplace Quick Start

Requirements:

- Node.js 22+

Install all workspace dependencies:

```bash
npm.cmd install
```

Start backend:

```bash
npm.cmd run dev:api
```

Start frontend:

```bash
npm.cmd run dev:web
```

Build frontend:

```bash
npm.cmd run build:web
```

Run backend smoke test:

```bash
npm.cmd run smoke:api
```

Run full verification:

```bash
npm.cmd run verify:marketplace
```

## Windows One-Click Scripts

```bat
scripts\install-marketplace.cmd
scripts\start-marketplace.cmd
scripts\verify-marketplace.cmd
```

## Demo Accounts

- `admin@henghesha.com / password123`
- `school@example.com / password123`
- `enterprise@example.com / password123`

## Environment Variables

Frontend example:

- [apps/marketplace-web/.env.example](C:/Users/william/Documents/New%20project/apps/marketplace-web/.env.example)

Backend example:

- [apps/marketplace-api/.env.example](C:/Users/william/Documents/New%20project/apps/marketplace-api/.env.example)

Common variables:

- `VITE_API_BASE_URL`
- `PORT`
- `CLIENT_ORIGIN`
- `JWT_SECRET`
- `DATABASE_PATH`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## Database Scripts

- SQLite: [apps/marketplace-api/sql/schema.sqlite.sql](C:/Users/william/Documents/New%20project/apps/marketplace-api/sql/schema.sqlite.sql)
- SQLite seed: [apps/marketplace-api/sql/seed.sqlite.sql](C:/Users/william/Documents/New%20project/apps/marketplace-api/sql/seed.sqlite.sql)
- PostgreSQL / Supabase: [apps/marketplace-api/sql/schema.postgres.sql](C:/Users/william/Documents/New%20project/apps/marketplace-api/sql/schema.postgres.sql)
- PostgreSQL / Supabase seed: [apps/marketplace-api/sql/seed.postgres.sql](C:/Users/william/Documents/New%20project/apps/marketplace-api/sql/seed.postgres.sql)

## Marketplace Preview

Homepage:

![Henghesha marketplace homepage](C:/Users/william/Documents/New%20project/docs/screenshots/homepage.png)

Templates:

![Henghesha marketplace templates](C:/Users/william/Documents/New%20project/docs/screenshots/templates.png)

Cases:

![Henghesha marketplace cases](C:/Users/william/Documents/New%20project/docs/screenshots/cases.png)

Agent detail:

![Henghesha marketplace agent detail](C:/Users/william/Documents/New%20project/docs/screenshots/agent-detail.png)

Auth:

![Henghesha marketplace auth](C:/Users/william/Documents/New%20project/docs/screenshots/auth.png)

School workspace:

![Henghesha marketplace school upload](C:/Users/william/Documents/New%20project/docs/screenshots/school-upload.png)

Enterprise order:

![Henghesha marketplace enterprise order](C:/Users/william/Documents/New%20project/docs/screenshots/enterprise-order.png)

Orders:

![Henghesha marketplace orders](C:/Users/william/Documents/New%20project/docs/screenshots/orders.png)

Profile:

![Henghesha marketplace profile](C:/Users/william/Documents/New%20project/docs/screenshots/profile.png)

Admin:

![Henghesha marketplace admin](C:/Users/william/Documents/New%20project/docs/screenshots/admin.png)
