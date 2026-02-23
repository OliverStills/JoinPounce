/**
 * JoinPounce — Daily Price Checker Cron Worker
 *
 * Railway cron: 0 9 * * * UTC (9:00 AM UTC daily)
 *
 * Responsibilities:
 *   1. Connect to PostgreSQL + Redis
 *   2. Fetch all active items in batches of 50
 *   3. Check current price via appropriate retailer API
 *   4. Store result in price_history table
 *   5. Apply significance threshold logic:
 *        - Drop must be ≥ 10% OR ≥ $10 (whichever is greater)
 *        - Must be a genuine new low in the last 30 days
 *   6. Queue threshold-passing items to Redis for notify.ts
 *   7. Log all results to Sentry
 *   8. MUST call process.exit(0) when done — Railway requirement
 *
 * @see JoinPounce master doc — Price Alert Logic, Mission 5
 */

import * as Sentry from '@sentry/node';
// TODO Mission 2: import { pool } from './db';
// TODO Mission 3: import { checkPrice, isPriceDropSignificant } from '../../api/src/services/price-checker';

const BATCH_SIZE = 50;

// ─── Sentry Init ──────────────────────────────────────────────────────────────
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.APP_ENV ?? 'development',
    });
}

async function run(): Promise<void> {
    console.log(`[price-check] Starting — ${new Date().toISOString()}`);
    const startTime = Date.now();

    let processedCount = 0;
    let errorCount = 0;
    let queuedForNotification = 0;

    try {
        // TODO Mission 2: Replace this stub with real DB connection
        // const client = await pool.connect();

        // TODO Mission 2: Paginate through active items
        // const items = await client.query(`
        //   SELECT id, canonical_url, retailer, variant_params,
        //          current_price, alert_threshold_percent, alert_threshold_amount,
        //          user_id, list_id
        //   FROM items
        //   WHERE is_active = TRUE AND is_dead = FALSE
        //   ORDER BY last_checked ASC NULLS FIRST
        // `);

        console.log('[price-check] STUB: DB not connected yet (Mission 2)');

        // TODO Mission 3: Process items in batches of BATCH_SIZE
        // for (let i = 0; i < items.rows.length; i += BATCH_SIZE) {
        //   const batch = items.rows.slice(i, i + BATCH_SIZE);
        //   await Promise.allSettled(batch.map(item => processItem(item, client)));
        //   processedCount += batch.length;
        // }

        // TODO Mission 5: Full implementation
        // After price check, items that pass threshold are queued to Redis:
        // await redis.lpush('notification_queue', JSON.stringify({ item_id, price_before, price_after, affiliate_url }))

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(
            `[price-check] Done in ${elapsed}s — processed: ${processedCount}, errors: ${errorCount}, queued: ${queuedForNotification}`
        );
    } catch (err) {
        Sentry.captureException(err);
        console.error('[price-check] Fatal error:', err);
        process.exit(1);
    }

    // CRITICAL: Railway skips next run if process doesn't exit
    process.exit(0);
}

run();
