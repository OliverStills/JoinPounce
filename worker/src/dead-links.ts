/**
 * JoinPounce — Dead Link Checker Cron Worker
 *
 * Railway cron: 0 3 * * * UTC (3:00 AM UTC daily)
 *
 * Responsibilities:
 *   1. Connect to PostgreSQL
 *   2. Check all active items for 404 / out-of-stock responses
 *   3. When dead link detected:
 *        a. Set is_dead = TRUE on item
 *        b. Run similarity search (strip title to keywords, search retailer APIs, filter ±20% price)
 *        c. Notify user: "[Product] is no longer available. Here are 3 similar items."
 *        d. Each suggestion is an affiliate link
 *        e. Archive item — NEVER DELETE, preserve price_history as data asset
 *   4. Log all results to Sentry
 *   5. MUST call process.exit(0) when done
 *
 * @see JoinPounce master doc — Dead Link Handling
 */

import * as Sentry from '@sentry/node';
// TODO Mission 2: import { pool } from './db';
// TODO Mission 3: import { findSimilarProducts } from '../../api/src/services/similarity-search';
// TODO Mission 3: import { injectAffiliateTag } from '../../api/src/services/affiliate-injector';

// ─── Sentry Init ──────────────────────────────────────────────────────────────
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.APP_ENV ?? 'development',
    });
}

async function run(): Promise<void> {
    console.log(`[dead-links] Starting — ${new Date().toISOString()}`);
    const startTime = Date.now();

    let checkedCount = 0;
    let deadCount = 0;
    let errorCount = 0;

    try {
        // TODO Mission 2: Connect to DB
        // const client = await pool.connect();

        // TODO Mission 5: Fetch all active, non-dead items
        // const items = await client.query(`
        //   SELECT id, canonical_url, retailer, product_name, current_price, user_id
        //   FROM items
        //   WHERE is_active = TRUE AND is_dead = FALSE
        // `);

        console.log('[dead-links] STUB: DB not connected yet (Mission 2)');

        // TODO Mission 5: For each item:
        // 1. HEAD request to canonical_url — check status code
        // 2. If 404 or permanent redirect to homepage → mark as dead
        // 3. If out of stock → mark as dead (retailer-specific detection)
        //
        // When dead:
        // 4. UPDATE items SET is_dead = TRUE, is_active = FALSE WHERE id = $1
        // 5. const suggestions = await findSimilarProducts(product_name, current_price, retailer)
        // 6. Format FCM notification with up to 3 affiliate-linked suggestions
        // 7. Send notification
        // 8. INSERT INTO notifications (user_id, item_id, type='dead_link', ...)
        //
        // IMPORTANT: Never DELETE items — archive them for price_history data asset

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(
            `[dead-links] Done in ${elapsed}s — checked: ${checkedCount}, dead: ${deadCount}, errors: ${errorCount}`
        );
    } catch (err) {
        Sentry.captureException(err);
        console.error('[dead-links] Fatal error:', err);
        process.exit(1);
    }

    // CRITICAL: Railway skips next run if process doesn't exit
    process.exit(0);
}

run();
