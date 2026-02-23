/**
 * JoinPounce — Notification Dispatcher Cron Worker
 *
 * Railway cron: 30 9 * * * UTC (9:30 AM UTC daily, 30min after price-check)
 *
 * Responsibilities:
 *   1. Connect to PostgreSQL + Redis
 *   2. Read all items queued by price-check.ts from Redis
 *   3. Apply notification guards per user:
 *        - Max 2 notifications per user per day
 *        - Re-check price 2-4 hours after initial detection (confirm drop held)
 *        - Shared list: owner notified first, members 15 min later
 *   4. Generate affiliate URL for each notification
 *   5. Send FCM push notification via Firebase Admin SDK
 *   6. Write to notifications table: sent_at, affiliate_url
 *   7. Log errors to Sentry
 *   8. MUST call process.exit(0) when done
 *
 * @see JoinPounce master doc — Price Alert Logic, Affiliate Link Injection
 */

import * as Sentry from '@sentry/node';
// TODO Mission 2: import { pool } from './db';
// TODO Mission 2: import Redis from 'ioredis';
// TODO Mission 3: import { injectAffiliateTag } from '../../api/src/services/affiliate-injector';
// Firebase Admin SDK for FCM push notifications
// TODO Mission 5: import admin from 'firebase-admin';

// ─── Sentry Init ──────────────────────────────────────────────────────────────
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.APP_ENV ?? 'development',
    });
}

const MAX_NOTIFICATIONS_PER_USER_PER_DAY = 2;
const SHARED_LIST_MEMBER_DELAY_MS = 15 * 60 * 1000; // 15 minutes

async function run(): Promise<void> {
    console.log(`[notify] Starting — ${new Date().toISOString()}`);
    const startTime = Date.now();

    let sentCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    try {
        // TODO Mission 2: Connect to Redis and DB
        // const redis = new Redis(process.env.REDIS_URL!);
        // const client = await pool.connect();

        // TODO Mission 5: Drain the Redis notification queue
        // const queuedItems = await redis.lrange('notification_queue', 0, -1);
        // await redis.del('notification_queue');

        console.log('[notify] STUB: DB/Redis not connected yet (Mission 2)');

        // TODO Mission 5: For each queued item:
        // 1. Load item + user from DB
        // 2. Check user hasn't hit daily notification limit:
        //    SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND sent_at > NOW() - INTERVAL '24 hours'
        // 3. Re-validate price drop (confirm it held — Amazon fluctuates)
        // 4. Generate affiliate URL: injectAffiliateTag(canonical_url, retailer)
        // 5. Send FCM: admin.messaging().send({ token: fcm_token, notification: { title, body }, data: { affiliate_url } })
        // 6. INSERT INTO notifications (user_id, item_id, type, price_before, price_after, affiliate_url, sent_at)
        // 7. If shared list: schedule member notifications 15min later via Redis ZADD with timestamp score

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(
            `[notify] Done in ${elapsed}s — sent: ${sentCount}, skipped: ${skippedCount}, errors: ${errorCount}`
        );
    } catch (err) {
        Sentry.captureException(err);
        console.error('[notify] Fatal error:', err);
        process.exit(1);
    }

    // CRITICAL: Railway skips next run if process doesn't exit
    process.exit(0);
}

run();
