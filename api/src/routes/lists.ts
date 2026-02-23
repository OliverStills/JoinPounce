import type { FastifyInstance } from 'fastify';
import type { CreateListRequest } from '@joinpounce/shared';

// TODO Mission 2: import db from '../db';

export async function listRoutes(app: FastifyInstance) {
    // GET /api/lists — get all lists for current user
    app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
        // TODO Mission 2: SELECT * FROM lists WHERE user_id = $1
        app.log.info({ user: request.user }, 'GET /lists stub');
        return reply.send({ lists: [] });
    });

    // POST /api/lists — create a new list
    app.post<{ Body: CreateListRequest }>(
        '/',
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            const { name, is_shared = false } = request.body;

            if (!name) {
                return reply.status(400).send({ error: 'List name required' });
            }

            // TODO Mission 2: INSERT INTO lists ...
            app.log.info({ name, is_shared }, 'POST /lists stub');
            return reply.status(201).send({
                list: { id: 'stub-list-id', name, is_shared, created_at: new Date() },
            });
        }
    );

    // GET /api/lists/:id — get list by ID (also used for shared list preview via share_token)
    app.get<{ Params: { id: string } }>(
        '/:id',
        async (request, reply) => {
            const { id } = request.params;
            // TODO Mission 2: SELECT with JOIN on items, check is_shared / share_token
            app.log.info({ id }, 'GET /lists/:id stub');
            return reply.send({ list: null, items: [] });
        }
    );

    // PATCH /api/lists/:id — update list (rename, toggle sharing)
    app.patch<{ Params: { id: string } }>(
        '/:id',
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            const { id } = request.params;
            // TODO Mission 2: UPDATE lists SET ...
            app.log.info({ id, body: request.body }, 'PATCH /lists/:id stub');
            return reply.send({ success: true });
        }
    );

    // DELETE /api/lists/:id
    app.delete<{ Params: { id: string } }>(
        '/:id',
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            const { id } = request.params;
            // TODO Mission 2: DELETE FROM lists WHERE id = $1 AND user_id = $2
            app.log.info({ id }, 'DELETE /lists/:id stub');
            return reply.send({ success: true });
        }
    );
}
