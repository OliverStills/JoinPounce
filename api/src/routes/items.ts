import type { FastifyInstance } from 'fastify';
import type { AddItemRequest, ItemPreviewRequest } from '@joinpounce/shared';

// TODO Mission 3: import { normalizeUrl } from '../services/url-normalizer';
// TODO Mission 2: import db from '../db';

export async function itemRoutes(app: FastifyInstance) {
    // POST /api/items/preview — previews a URL before saving (used by iOS Share Extension)
    // This must be fast ( < 2s) since it runs inside the share sheet overlay
    app.post<{ Body: ItemPreviewRequest }>(
        '/preview',
        async (request, reply) => {
            const { url } = request.body;

            if (!url) {
                return reply.status(400).send({ error: 'URL required' });
            }

            // TODO Mission 3: call normalizeUrl(), fetch product metadata from retailer API
            app.log.info({ url }, 'POST /items/preview stub');
            return reply.send({
                product_name: 'Product Preview (stub)',
                product_image: null,
                current_price: null,
                retailer: null,
                canonical_url: url,
                is_supported: false,
                variant_params: {},
            });
        }
    );

    // GET /api/items — list items (optionally by list_id)
    app.get(
        '/',
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            // TODO Mission 2: SELECT * FROM items WHERE user_id = $1 [AND list_id = $2]
            return reply.send({ items: [] });
        }
    );

    // POST /api/items — add a new tracked item
    app.post<{ Body: AddItemRequest }>(
        '/',
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            const { list_id, url } = request.body;

            if (!list_id || !url) {
                return reply.status(400).send({ error: 'list_id and url required' });
            }

            // TODO Mission 3: normalize URL, fetch price, insert into items + price_history
            app.log.info({ list_id, url }, 'POST /items stub');
            return reply.status(201).send({ item: { id: 'stub-item-id', url } });
        }
    );

    // GET /api/items/:id
    app.get<{ Params: { id: string } }>(
        '/:id',
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            const { id } = request.params;
            // TODO Mission 2: SELECT with price_history join
            return reply.send({ item: null, price_history: [] });
        }
    );

    // PATCH /api/items/:id — update alert thresholds, target price, etc.
    app.patch<{ Params: { id: string } }>(
        '/:id',
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            const { id } = request.params;
            // TODO Mission 2: UPDATE items SET ...
            app.log.info({ id, body: request.body }, 'PATCH /items/:id stub');
            return reply.send({ success: true });
        }
    );

    // DELETE /api/items/:id — soft delete (set is_active = false)
    app.delete<{ Params: { id: string } }>(
        '/:id',
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            const { id } = request.params;
            // TODO Mission 2: UPDATE items SET is_active = false WHERE id = $1 AND user_id = $2
            app.log.info({ id }, 'DELETE /items/:id stub');
            return reply.send({ success: true });
        }
    );
}
