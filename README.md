# JoinPounce

> A mobile-first price tracking and wishlist app. Users share product links via the iOS share sheet — JoinPounce watches prices daily and sends push notifications when prices drop, routing every purchase through an affiliate link.

**Domain:** joinpounce.com  
**Hosting:** Railway  
**Stack:** Next.js 14 | Fastify | PostgreSQL | Redis | FCM | Swift/SwiftUI

---

## Monorepo Structure

```
joinpounce/
├── web/        # Next.js 14 website (App Router + Tailwind)
├── api/        # Fastify REST API (Node.js + TypeScript)
├── worker/     # Cron job services (price check, notify, dead links)
├── shared/     # Shared TypeScript types (used by api + worker)
└── ios/        # Swift/SwiftUI iOS app (Phase 3)
```

---

## Services

### `/web` — Marketing Website + Web App

Next.js 14 App Router with Tailwind CSS. Deployed on Railway.

**Pages:**
- `/` — Landing page with email waitlist capture
- `/signup` — Web signup with Stripe ($4.99, bypasses Apple 30% cut)
- `/list/[id]` — Shared list preview (viral acquisition page)
- `/invite/[username]` — Personalized invite page
- `/download` — App Store redirect / waitlist confirmation

**Run locally:**
```bash
cd web
npm install
npm run dev
# → http://localhost:3000
```

---

### `/api` — Fastify API Server

TypeScript REST API. Deployed on Railway at `api.joinpounce.com`.

**Routes:**
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — JWT login
- `GET/POST /api/lists` — List management
- `GET/POST/DELETE /api/items` — Item CRUD
- `POST /api/items/preview` — URL preview for share extension
- `POST /api/waitlist` — Email capture
- `GET /health` — Health check for Railway

**Run locally:**
```bash
cd api
npm install
npm run dev
# → http://localhost:8080
```

---

### `/worker` — Cron Job Services

Three Node.js scripts that run on Railway cron. Each **must call `process.exit(0)`** when done or Railway will skip the next scheduled run.

| Script | Railway Cron | Purpose |
|--------|-------------|---------|
| `price-check.ts` | `0 9 * * *` UTC | Checks prices for all active items |
| `notify.ts` | `30 9 * * *` UTC | Dispatches push notifications for price drops |
| `dead-links.ts` | `0 3 * * *` UTC | Flags dead/out-of-stock items, finds alternatives |

**Run a worker locally (one-time execution):**
```bash
cd worker
npm install
npm run build
node dist/price-check.js   # or notify.js / dead-links.js
```

---

### `/shared` — TypeScript Types

Shared TypeScript interfaces matching the PostgreSQL schema. Imported by both `api` and `worker`.

```ts
import type { User, Item, PriceHistory, Notification } from '@joinpounce/shared'
```

---

## Local Development (Full Stack)

### Prerequisites
- Node.js 20+
- PostgreSQL (local or Railway proxy)
- Redis (local or Railway proxy)

### Setup

```bash
# 1. Clone and install all workspaces
git clone https://github.com/YOUR_USERNAME/joinpounce.git
cd joinpounce
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your local DB and Redis URLs

# 3. Run database migrations
psql $DATABASE_URL < api/src/db/migrations/001_initial.sql

# 4. Start services
npm run dev:api    # API on :8080
npm run dev:web    # Web on :3000
```

---

## Deployment (Railway)

All services deploy via `railway.toml` in the repo root:

- **web** → builds from `/web`, starts with `npm start`
- **api** → builds from `/api`, starts with `node dist/index.js`
- **price-checker** → builds from `/worker`, runs cron `0 9 * * *`
- **notify-dispatcher** → builds from `/worker`, runs cron `30 9 * * *`
- **dead-link-checker** → builds from `/worker`, runs cron `0 3 * * *`

Required Railway plugins: **PostgreSQL** + **Redis**

Set all environment variables from `.env.example` in the Railway dashboard.

---

## The Core Loop

1. User finds a product (Amazon, Target, Walmart, Best Buy, Wayfair)
2. User taps **Share → JoinPounce** in any iOS app
3. App saves item, normalizes URL, begins tracking daily
4. Price drops past threshold → push notification fires with affiliate link
5. User taps → buys → JoinPounce earns affiliate commission
6. User saved money → tells a friend → friend downloads JoinPounce

**The one metric:** What % of price drop notifications result in a purchase within 24 hours.

---

## Monetization

- **$4.99 one-time** via web Stripe (bypasses Apple 30% cut)
- **$2.99/month or $19.99/year** Pro tier (unlimited items, daily checks, price history)
- **Affiliate commissions** 1–8% per purchase routed through affiliate links
- **Free tier:** 15 items, weekly checks

---

*JoinPounce — Built with Google Antigravity + Claude Sonnet 4.6*  
*Domain: joinpounce.com | Hosting: Railway*
