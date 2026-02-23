import type { FastifyInstance } from 'fastify';
import type { SupportedRetailer } from '@joinpounce/shared';

// TODO Mission 3: import { injectAffiliateTag } from '../services/affiliate-injector';

export async function affiliateRoutes(app: FastifyInstance) {
    // GET /api/affiliate/link — generate an affiliate link for a canonical URL
    app.get<{
        Querystring: { url: string; retailer: SupportedRetailer };
    }>(
        '/link',
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            const { url, retailer } = request.query;

            if (!url || !retailer) {
                return reply.status(400).send({ error: 'url and retailer required' });
            }

            // TODO Mission 3: injectAffiliateTag(url, retailer)
            app.log.info({ url, retailer }, 'GET /affiliate/link stub');
            return reply.send({ affiliate_url: url + '#stub-affiliate' });
        }
    );

    // POST /api/affiliate/click — log an affiliate link click (buy now tapped)
    app.post<{
        Body: { notification_id?: string; item_id: string; retailer: SupportedRetailer };
    }>(
        '/click',
        async (request, reply) => {
            const { notification_id, item_id, retailer } = request.body;
            // TODO Mission 2: update notifications.opened_at, log click event to analytics
            app.log.info({ notification_id, item_id, retailer }, 'Affiliate click logged');
            return reply.send({ success: true });
        }
    );
}
