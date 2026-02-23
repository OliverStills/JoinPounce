# JoinPounce — Master Build Document for Antigravity

> Feed this entire document to Antigravity at the start of every session.
> Model: Claude Sonnet 4.6 for all tasks. Switch to Opus 4.6 only for complex architectural problems.

---

## What We Are Building

JoinPounce is a mobile-first price tracking and wishlist app. Users share product links from any retailer into the app via the iOS/Android share sheet. The app organizes items into named lists and sends push notifications when prices drop to the user's target threshold. Every notification that leads to a purchase routes through an affiliate link, generating commission revenue automatically.

**Domain:** joinpounce.com (registered on Porkbun)
**Hosting:** Railway (project already created, connected to GitHub repo: joinpounce)
**GitHub Repo:** joinpounce (private)
**Build Environment:** Google Antigravity IDE
**Primary AI Model:** Claude Sonnet 4.6 (model string: claude-sonnet-4-6)

---

## The Core Loop (Never Lose Sight of This)

1. User finds a product they want (IKEA, Amazon, Target, anywhere)
2. User taps Share → selects JoinPounce from share sheet
3. App saves the item, normalizes the URL, begins tracking price daily
4. When price drops past threshold → push notification fires with affiliate link
5. User taps → buys → we earn affiliate commission
6. User saved money → they tell a friend → friend downloads JoinPounce

**The one metric that proves this is a business:** what % of price drop notifications result in a purchase. Build everything in service of proving that number is high.

---

## Tech Stack — Use Exactly This

| Layer | Technology | Why |
|---|---|---|
| Web Frontend | Next.js 14 (App Router) + Tailwind CSS | Railway native, SSR for shared list previews |
| API Backend | Node.js + Fastify | Fast, TypeScript-native, Railway deploys easily |
| Database | PostgreSQL on Railway | Managed, one-click provision in Railway dashboard |
| Cache / Queue | Redis on Railway | Notification queuing, rate limiting, API response caching |
| Price Check Cron | Node.js service on Railway cron | Runs `0 9 * * *` UTC daily, exits when done |
| Notification Cron | Node.js service on Railway cron | Runs `30 9 * * *` UTC daily, exits when done |
| Dead Link Cron | Node.js service on Railway cron | Runs `0 3 * * *` UTC daily, exits when done |
| Push Notifications | Firebase Cloud Messaging (FCM) | Free at any scale |
| Payments (Web) | Stripe | Bypasses Apple's 30% cut for web signups |
| Payments (iOS) | Apple IAP | Required for in-app purchases |
| Transactional Email | Resend | Domain: joinpounce.com verified |
| Error Monitoring | Sentry | Silent cron failures must be caught immediately |
| Analytics | PostHog | Self-hosted option available, privacy-first |
| iOS App | Swift + SwiftUI | Native iOS, previewed in Xcode |
| Share Extension | iOS Share Extension (Swift) | Registers app in iOS share sheet |

**Language:** TypeScript everywhere on the backend. Swift for iOS only.

---

## Repository Structure

Build as a monorepo with this exact folder structure:

```
joinpounce/
├── web/                          # Next.js 14 website
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── signup/page.tsx       # Web signup with Stripe
│   │   ├── list/[id]/page.tsx    # Shared list preview (viral page)
│   │   └── invite/[username]/page.tsx  # Personalized invite page
│   ├── components/
│   └── package.json
│
├── api/                          # Fastify API server
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── lists.ts
│   │   │   ├── items.ts
│   │   │   ├── notifications.ts
│   │   │   └── affiliate.ts
│   │   ├── services/
│   │   │   ├── url-normalizer.ts
│   │   │   ├── price-checker.ts
│   │   │   ├── affiliate-injector.ts
│   │   │   └── similarity-search.ts
│   │   └── index.ts
│   └── package.json
│
├── worker/                       # Cron job services
│   ├── src/
│   │   ├── price-check.ts        # Daily price checker (cron: 0 9 * * *)
│   │   ├── notify.ts             # Notification dispatcher (cron: 30 9 * * *)
│   │   └── dead-links.ts         # Dead link checker (cron: 0 3 * * *)
│   └── package.json
│
├── shared/                       # Shared TypeScript types
│   ├── src/
│   │   └── types.ts
│   └── package.json
│
├── ios/                          # Swift iOS app (Xcode project)
│   ├── JoinPounce/
│   └── JoinPounceShareExtension/
│
├── .env.example                  # All required environment variables
├── railway.toml                  # Railway deployment config
├── package.json                  # Root workspaces config
└── README.md
```

---

## Database Schema — Build This Exactly

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  stripe_customer_id VARCHAR(255),
  fcm_token VARCHAR(500),
  referral_code VARCHAR(20) UNIQUE,
  referred_by UUID REFERENCES users(id),
  last_active TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lists
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_shared BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- List collaborators (for shared lists)
CREATE TABLE list_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'viewer',
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Items
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  retailer VARCHAR(50) NOT NULL,
  product_name VARCHAR(500),
  product_image VARCHAR(1000),
  variant_params JSONB DEFAULT '{}',
  original_price DECIMAL(10,2),
  current_price DECIMAL(10,2),
  target_price DECIMAL(10,2),
  alert_threshold_percent DECIMAL(5,2) DEFAULT 10.00,
  alert_threshold_amount DECIMAL(10,2) DEFAULT 10.00,
  is_private BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_dead BOOLEAN DEFAULT FALSE,
  last_checked TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Price history
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  in_stock BOOLEAN DEFAULT TRUE,
  checked_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('price_drop', 'dead_link', 'reengagement', 'return_window', 'shared_list')),
  price_before DECIMAL(10,2),
  price_after DECIMAL(10,2),
  affiliate_url TEXT,
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  converted_at TIMESTAMP,
  purchase_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Waitlist (pre-launch email captures)
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  referral_source VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_items_list_id ON items(list_id);
CREATE INDEX idx_items_active ON items(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_price_history_item_id ON price_history(item_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

---

## Supported Retailers at Launch

**Day 1 — API-backed (reliable):**
- Amazon (Product Advertising API)
- Target (Roundel API via Impact affiliate)
- Walmart (Walmart Open API)
- Best Buy (Best Buy API)
- Wayfair (CJ Affiliate API)

**Phase 2 — Scraping required (fragile, add after revenue):**
- IKEA
- Macy's

**When unsupported link received, respond:**
`"We don't support [Retailer] yet — want us to notify you when we do?"` Then log the retailer to a `requested_retailers` table.

---

## URL Normalization Rules

Every incoming URL must be processed through this pipeline before storage:

1. Resolve all redirects to final destination URL
2. Strip all tracking parameters: `utm_*`, `ref`, `tag`, `affiliate`, `source`, `fbclid`, `gclid`, `mc_eid`, `_ga`
3. Strip existing affiliate tags (Amazon's `tag=`, etc.) — replace with ours at notification time
4. Extract canonical product URL
5. Detect retailer from domain
6. Extract and store variant parameters separately in `variant_params` JSONB (size, color, style, etc.)
7. Lock tracker to exact variant — drift to wrong variant = dead link event, not price update

---

## Price Alert Logic — Implement This Exactly

A notification fires ONLY when ALL of these conditions are true:

1. Price dropped by at least the user's threshold (default: 10% OR $10, whichever is greater)
2. This price is a genuine new low in the last 30 days (cross-reference price_history)
3. Re-check the price 2-4 hours after detecting the drop before firing — Amazon fluctuates, confirm it held
4. User has not received more than 2 notifications today across all items
5. Item is still in stock

If a shared list: owner gets notification first. Other members get notified 15 minutes later.

---

## Affiliate Link Injection

When a notification fires or a user taps "Buy Now":
1. Take the canonical_url
2. Strip any existing affiliate parameters
3. Append our affiliate tag for that retailer
4. Log the generated URL to the notifications table as affiliate_url
5. Track click (opened_at) and conversion (converted_at + purchase_amount)

**Affiliate program IDs (fill in after approval):**
```
AMAZON_AFFILIATE_TAG=joinpounce-20        # pending approval
TARGET_AFFILIATE_ID=                       # pending approval via Impact
WALMART_AFFILIATE_ID=                      # pending approval via Impact
BESTBUY_AFFILIATE_ID=                      # pending approval via CJ
WAYFAIR_AFFILIATE_ID=                      # pending approval via CJ
```

---

## Railway Deployment Config

Create `railway.toml` in the root:

```toml
[build]
builder = "nixpacks"

[[services]]
name = "web"
source = "web"
[services.deploy]
startCommand = "npm start"
healthcheckPath = "/"

[[services]]
name = "api"
source = "api"
[services.deploy]
startCommand = "node dist/index.js"
healthcheckPath = "/health"

[[services]]
name = "price-checker"
source = "worker"
[services.deploy]
startCommand = "node dist/price-check.js"
cronSchedule = "0 9 * * *"

[[services]]
name = "notify-dispatcher"
source = "worker"
[services.deploy]
startCommand = "node dist/notify.js"
cronSchedule = "30 9 * * *"

[[services]]
name = "dead-link-checker"
source = "worker"
[services.deploy]
startCommand = "node dist/dead-links.js"
cronSchedule = "0 3 * * *"
```

**Critical Railway cron rule:** Every cron service MUST call `process.exit(0)` when done. If it doesn't exit, Railway skips the next scheduled run.

---

## Environment Variables (.env.example)

```bash
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_ONETIME=
STRIPE_PRICE_ID_PRO_MONTHLY=

# Apple IAP
APPLE_IAP_SHARED_SECRET=

# Firebase (Push Notifications)
FCM_PROJECT_ID=
FCM_PRIVATE_KEY=
FCM_CLIENT_EMAIL=

# Resend (Email)
RESEND_API_KEY=
EMAIL_FROM=noreply@joinpounce.com

# Sentry (Error Monitoring)
SENTRY_DSN=

# PostHog (Analytics)
POSTHOG_API_KEY=

# Affiliate IDs
AMAZON_AFFILIATE_TAG=
TARGET_AFFILIATE_ID=
WALMART_AFFILIATE_ID=
BESTBUY_AFFILIATE_ID=
WAYFAIR_AFFILIATE_ID=

# Retailer APIs
AMAZON_ACCESS_KEY=
AMAZON_SECRET_KEY=
AMAZON_PARTNER_TAG=
BESTBUY_API_KEY=

# App Config
NEXT_PUBLIC_APP_URL=https://joinpounce.com
API_URL=https://api.joinpounce.com
APP_ENV=production
```

---

## Website Pages — Build These First

### 1. Landing Page (/)
- Headline: "Stop missing sales on things you actually want."
- Subheadline: "JoinPounce watches your wishlist and texts you the moment prices drop."
- Animated demo: 15-second loop showing share sheet → list saved → notification fired → purchase
- Email capture form → POST /api/waitlist
- Download CTA button (links to App Store when live, waitlist until then)
- Social proof counter: "X people already tracking Y items" (pulls from DB)
- How it works: 3 steps — Save it, Watch it, Pounce on it
- Supported retailers logos row
- OpenGraph tags for social sharing

### 2. Shared List Preview (/list/[id])
- Fetches list by share_token
- Renders product cards: image, name, current price, original price, % saved badge
- Price sparkline chart (90-day history)
- "Price dropped X% last week" badge where relevant
- Bottom CTA: "Want alerts on your own wishlist? Download JoinPounce."
- This is the viral acquisition page — make it beautiful

### 3. Web Signup (/signup)
- Email + password fields
- Stripe payment: $4.99 one-time
- On success: create user account, send welcome email via Resend, redirect to download page
- This bypasses Apple's 30% cut

### 4. Invite Page (/invite/[username])
- "[Name] invited you to JoinPounce"
- Short personalized message
- Referral code pre-applied
- Same CTA as landing page

### 5. Download Page (/download)
- App Store button (when live)
- Until App Store live: "You're on the list — we'll email you the moment it's available"

---

## iOS App Screens (Phase 3)

Build in Swift + SwiftUI, preview in Xcode:

1. **Onboarding** — email/phone signup, skip everything else, drop directly into first item add
2. **Home / Lists View** — all lists, item count, last price change summary
3. **List Detail** — items in list, current vs original price, % change badge
4. **Item Detail** — product image, price history chart (90-day sparkline), alert threshold setting, Buy Now button (affiliate link)
5. **Add Item** — paste URL flow + clipboard detection
6. **Notifications Settings** — per-item threshold configuration
7. **Share Extension** — compact overlay that appears inside Safari/Chrome/Amazon app

---

## Share Extension Behavior (iOS)

When user taps Share → JoinPounce in any app:
1. Receive URL from share sheet
2. Call API: POST /api/items/preview with the URL
3. API returns: product name, image, detected retailer, current price
4. Show compact overlay (NOT full screen) inside the sharing app:
   - Product thumbnail + name
   - Current price
   - List picker (dropdown of user's lists, default to last used)
   - "Track Price" button
5. On confirm: save item, show checkmark, auto-dismiss after 1.5 seconds
6. User never leaves the app they were browsing

---

## Virality Mechanics — Build These In

**Shared Lists:**
- Any list can be made shareable with one toggle
- Generates a unique share_token → joinpounce.com/list/[token]
- Link renders the beautiful shared list preview page
- Recipient sees items without downloading, CTA to download at bottom

**Invite Links:**
- Every user gets a personal joinpounce.com/invite/[username] URL
- Invite screen in app: Share via iMessage, Copy Link, QR Code (generated from username URL)
- Successful invite = 1 month Pro free for both users

**Post-Purchase Share:**
- After affiliate purchase confirmed: "You saved $47 on the MALM dresser 🎉"
- One-tap to share: pre-written iMessage "I just saved $47 using JoinPounce — joinpounce.com/invite/oliver"

**App Store Rating Prompt:**
- Fires once, immediately after first successful price-drop purchase
- Only at that moment — peak emotional satisfaction

---

## Dead Link Handling

When an item returns 404 or out-of-stock:
1. Set `is_dead = TRUE` on the item
2. Run similarity search: strip product title to keywords, search across supported retailer APIs, filter by original price ±20%, return top 3
3. Notify user: "[Product] is no longer available. Here are 3 similar items."
4. Each suggestion is an affiliate link
5. Archive original item — never delete, preserve price history for data asset

---

## Return Window Feature

After a purchase is confirmed through an affiliate link:
1. Store purchase date and product
2. Check price daily for 14 days after purchase
3. If price drops further within 14 days: notify user "Price dropped $X since you bought this — you may be eligible for a price adjustment. Contact [Retailer] customer service."
4. Include retailer customer service link
5. No other app does this — it's a trust builder

---

## Data Collection Strategy (Future Asset)

Every price check stores to price_history regardless of whether alert fires. Every notification stores sent_at, opened_at, converted_at, and purchase_amount. This builds the price elasticity dataset — what discount % triggers purchase by category. This data is a future B2B licensing asset worth $5K-$50K/month per retailer relationship. Collect it cleanly from day one. Never store personally identifiable data in analytics tables — only anonymized aggregates.

---

## Monetization

**Entry fee:** $4.99 one-time (via web Stripe to avoid Apple 30% cut)
**Pro tier:** $2.99/month or $19.99/year — adds daily checks, unlimited items, price history charts, shared lists, holiday predictions
**Free tier limits:** 15 items tracked, weekly price checks
**Affiliate:** All purchases route through affiliate links — commission 1-8% depending on retailer
**Future:** Anonymized trend data licensing to retailers

**Critical reputation rule:** When users pay $4.99, show clearly: "You're getting everything — forever at this price. Your current features will never go behind a paywall." Never take features away from paid users.

---

## Antigravity Mission Prompts — Use These In Order

### Mission 1: Project Scaffold
```
Create a monorepo for JoinPounce with folders: /web (Next.js 14 App Router + Tailwind), /api (Fastify + TypeScript), /worker (Node.js cron services), /shared (TypeScript types). Add root package.json with workspaces, .env.example with all variables from the master doc, .gitignore for Node, railway.toml deployment config, and README.md explaining each service. Initialize TypeScript configs for all services.
```

### Mission 2: Database
```
Create a PostgreSQL migration file for JoinPounce using the exact schema from the master doc. Include all tables, indexes, and constraints. Also create a /shared/src/types.ts file with TypeScript interfaces matching every table. Generate a db.ts connection utility using the pg library that reads DATABASE_URL from environment variables.
```

### Mission 3: URL Normalizer
```
Build a TypeScript service at /api/src/services/url-normalizer.ts that takes any product URL and returns: resolved final URL (following all redirects), stripped of all tracking and affiliate parameters, canonical product URL, detected retailer name (from supported list: amazon, target, walmart, bestbuy, wayfair), extracted variant parameters as key-value pairs, boolean for whether retailer is supported, and product metadata fetched from the appropriate retailer API. Handle malformed URLs, short links, and redirect chains gracefully. Write unit tests for 10 URL examples from each supported retailer.
```

### Mission 4: Landing Page
```
Build the JoinPounce landing page at /web/app/page.tsx using Next.js 14 App Router and Tailwind CSS. Design a premium, conversion-focused landing page with: hero section with headline "Stop missing sales on things you actually want", subheadline explaining the core loop, animated mockup placeholder, email capture form that POSTs to /api/waitlist, supported retailer logos (Amazon, Target, Walmart, Best Buy, Wayfair), 3-step how it works section (Save it / Watch it / Pounce on it), and footer. Color scheme: deep navy and electric blue with white. Mobile-first responsive design. Include proper OpenGraph meta tags for social sharing previews.
```

### Mission 5: Price Checker Cron
```
Build the daily price checker at /worker/src/price-check.ts. It should: connect to PostgreSQL and Redis, fetch all active items in batches of 50, check current price via the appropriate retailer API for each item, store result in price_history table, compare to previous price and apply significance threshold logic (drop must be 10% or $10, whichever is greater, AND must be a genuine new low vs last 30 days), queue items that pass threshold to Redis for the notification dispatcher, log all results to Sentry, and call process.exit(0) when complete. This runs on Railway cron: 0 9 * * * UTC.
```

---

## What Success Looks Like

**Week 2:** joinpounce.com is live with email capture. Affiliate accounts applied.
**Week 4:** Backend deployed on Railway. Can paste a URL and get back normalized product data with current price.
**Week 8:** iOS app working on simulator. Share extension captures URLs from Safari.
**Week 10:** End-to-end test: save an Amazon item → price drop detected → push notification fires → tap notification → affiliate link opens product page.
**Week 12:** 20 beta users using the app daily. At least 1 real purchase through affiliate link confirmed.
**Week 14:** App Store submission. $4.99 entry fee live.
**Month 4:** 100 paying users. Affiliate conversion rate measured and documented.

**The number that proves this is a business:** X% of price drop notifications result in a purchase within 24 hours. Get to this number as fast as possible with as few users as necessary. Everything else is secondary.

---

*JoinPounce — Built with Google Antigravity + Claude Sonnet 4.6 + Xcode*
*Domain: joinpounce.com | Hosting: Railway | Repo: github.com/[your-username]/joinpounce*
