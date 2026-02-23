import type { FastifyInstance } from 'fastify';

// TODO Mission 2: import db from '../db';

export async function notificationRoutes(app: FastifyInstance) {
    // GET /api/notifications — get notification history for current user
    app.get(
        '/',
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            // TODO Mission 2: SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC
            return reply.send({ notifications: [] });
        }
    );

    // POST /api/notifications/:id/opened — track when user opens a notification
    app.post<{ Params: { id: string } }>(
        '/:id/opened',
        async (request, reply) => {
            const { id } = request.params;
            // TODO Mission 2: UPDATE notifications SET opened_at = NOW() WHERE id = $1
            app.log.info({ notification_id: id }, 'Notification opened');
            return reply.send({ success: true });
        }
    );

    // POST /api/notifications/:id/converted — track when user completes a purchase
    // Called when affiliate link results in confirmed purchase
    app.post<{ Params: { id: string }; Body: { purchase_amount: number } }>(
        '/:id/converted',
        async (request, reply) => {
            const { id } = request.params;
            const { purchase_amount } = request.body;
            // TODO Mission 2: UPDATE notifications SET converted_at = NOW(), purchase_amount = $2 WHERE id = $1
            app.log.info({ notification_id: id, purchase_amount }, 'Purchase converted');
            return reply.send({ success: true });
        }
    );

    // POST /api/notifications/fcm-token — register or update FCM token
    app.post<{ Body: { fcm_token: string } }>(
        '/fcm-token',
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            const { fcm_token } = request.body;
            // TODO Mission 2: UPDATE users SET fcm_token = $1 WHERE id = $2
            app.log.info({ fcm_token: fcm_token?.slice(0, 10) + '...' }, 'FCM token registered');
            return reply.send({ success: true });
        }
    );
}
