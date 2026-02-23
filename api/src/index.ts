import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import * as Sentry from '@sentry/node';

import { authRoutes } from './routes/auth';
import { listRoutes } from './routes/lists';
import { itemRoutes } from './routes/items';
import { notificationRoutes } from './routes/notifications';
import { affiliateRoutes } from './routes/affiliate';

// ─── Sentry Init (must be first) ─────────────────────────────────────────────
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.APP_ENV ?? 'development',
    });
}

// ─── Fastify Instance ─────────────────────────────────────────────────────────
const app = Fastify({
    logger: {
        level: process.env.APP_ENV === 'production' ? 'warn' : 'info',
        transport:
            process.env.APP_ENV !== 'production'
                ? { target: 'pino-pretty', options: { colorize: true } }
                : undefined,
    },
});

// ─── Plugins ──────────────────────────────────────────────────────────────────
await app.register(cors, {
    origin: [
        process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'https://joinpounce.com',
        'https://www.joinpounce.com',
    ],
    credentials: true,
});

await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-this',
    sign: {
        expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },
});

await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
});

// ─── Routes ───────────────────────────────────────────────────────────────────
await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(listRoutes, { prefix: '/api/lists' });
await app.register(itemRoutes, { prefix: '/api/items' });
await app.register(notificationRoutes, { prefix: '/api/notifications' });
await app.register(affiliateRoutes, { prefix: '/api/affiliate' });

// ─── Waitlist Route ───────────────────────────────────────────────────────────
app.post('/api/waitlist', async (request, reply) => {
    const { email, referral_source } = request.body as {
        email: string;
        referral_source?: string;
    };

    if (!email || !email.includes('@')) {
        return reply.status(400).send({ error: 'Valid email required' });
    }

    // TODO: implement DB insert in Mission 2 (once db.ts is wired up)
    app.log.info({ email, referral_source }, 'Waitlist signup');
    return reply.status(201).send({ message: 'You are on the list 🎉' });
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', async (_request, reply) => {
    return reply.send({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Fallback ─────────────────────────────────────────────────────────────
app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({ error: 'Not found' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.setErrorHandler((error, _request, reply) => {
    Sentry.captureException(error);
    app.log.error(error);
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({
        error: statusCode === 500 ? 'Internal server error' : error.message,
    });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '8080', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`JoinPounce API running on http://${HOST}:${PORT}`);
} catch (err) {
    Sentry.captureException(err);
    app.log.error(err);
    process.exit(1);
}
