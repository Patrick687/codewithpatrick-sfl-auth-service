import passport from 'passport';
import express, { NextFunction, Response, Request } from 'express';

let mockBehavior: 'success' | 'noUser' | 'failure' | 'error' = 'success';

passport.authenticate = () => (req: Request, res: Response, next: NextFunction) => {
    if (mockBehavior === 'success') {
        req.user = { id: 'mock-user-id' };
        return next();
    }
    if (mockBehavior === 'noUser') {
        req.user = undefined;
        return next();
    }
    if (mockBehavior === 'failure') {
        return res.redirect('/');
    }
    if (mockBehavior === 'error') {
        throw new Error('OAuth error');
    }
    return next();
};

import request from 'supertest';
import router from '../../../routes';
import '../../setup';

const app = express();
app.use(express.json());
app.use('/', router);

describe('GET /google/callback', () => {
    it('should respond with a JWT token on successful authentication', async () => {
        mockBehavior = 'success';
        const res = await request(app).get('/google/callback');
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('should respond with token: null if no user is present', async () => {
        mockBehavior = 'noUser';
        const res = await request(app).get('/google/callback');
        expect(res.status).toBe(200);
        expect(res.body.token).toBeNull();
    });

    it('should redirect to / on authentication failure', async () => {
        mockBehavior = 'failure';
        const res = await request(app).get('/google/callback');
        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/');
    });

    it('should handle errors thrown in the callback', async () => {
        mockBehavior = 'error';
        const res = await request(app).get('/google/callback');
        expect([500, 401, 400]).toContain(res.status);
    });
});