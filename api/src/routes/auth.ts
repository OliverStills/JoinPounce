import type { FastifyInstance } from 'fastify';
import type { RegisterRequest, LoginRequest } from '@joinpounce/shared';

// TODO Mission 2: import db from '../db';
// TODO: import bcrypt from 'bcryptjs';

export async function authRoutes(app: FastifyInstance) {
    // POST /api/auth/register
    app.post<{ Body: RegisterRequest }>('/register', async (request, reply) => {
        const { email, password, referral_code } = request.body;

        if (!email || !password) {
            return reply.status(400).send({ error: 'Email and password required' });
        }

        // TODO Mission 2: hash password, create user in DB, generate referral_code
        app.log.info({ email, referral_code }, 'Register stub called');

        const token = app.jwt.sign({ sub: 'stub-user-id', email });
        return reply.status(201).send({ token, user: { id: 'stub', email } });
    });

    // POST /api/auth/login
    app.post<{ Body: LoginRequest }>('/login', async (request, reply) => {
        const { email, password } = request.body;

        if (!email || !password) {
            return reply.status(400).send({ error: 'Email and password required' });
        }

        // TODO Mission 2: lookup user, verify bcrypt hash, return JWT
        app.log.info({ email }, 'Login stub called');

        const token = app.jwt.sign({ sub: 'stub-user-id', email });
        return reply.send({ token, user: { id: 'stub', email } });
    });

    // GET /api/auth/me — returns current user from JWT
    app.get('/me', { preHandler: [app.authenticate] }, async (request, reply) => {
        return reply.send({ user: request.user });
    });
}
