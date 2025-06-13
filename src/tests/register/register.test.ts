import request from 'supertest';
import express from 'express';
import router from '../../routes';
import '../setup';

const app = express();
app.use(express.json());
app.use('/', router);

describe('Auth Integration', () => {
    describe('POST /register', () => {
        it('registers a new user and returns a JWT', async () => {
            const res = await request(app)
                .post('/register')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.status).toBe(201);
            expect(res.body.token).toBeDefined();
        });

        it('rejects duplicate email', async () => {
            await request(app)
                .post('/register')
                .send({ email: 'dupe@example.com', password: 'password123' });

            const res = await request(app)
                .post('/register')
                .send({ email: 'dupe@example.com', password: 'password123' });

            expect(res.status).toBe(409);
        });

        it('should fail if email is missing', async () => {
            const res = await request(app)
                .post('/register')
                .send({ password: 'password123' });
            expect(res.status).toBe(400);
            expect(res.body.errors).toBeDefined();
        });

        it('should fail if password is missing', async () => {
            const res = await request(app)
                .post('/register')
                .send({ email: 'missingpass@example.com' });
            expect(res.status).toBe(400);
            expect(res.body.errors).toBeDefined();
        });

        it('should fail if email is invalid', async () => {
            const res = await request(app)
                .post('/register')
                .send({ email: 'not-an-email', password: 'password123' });
            expect(res.status).toBe(400);
            expect(res.body.errors).toBeDefined();
        });

        it('should fail if password is too short', async () => {
            const res = await request(app)
                .post('/register')
                .send({ email: 'shortpass@example.com', password: 'short' });
            expect(res.status).toBe(400);
            expect(res.body.errors).toBeDefined();
        });

        it('should not leak password hash in response', async () => {
            const res = await request(app)
                .post('/register')
                .send({ email: 'nohash@example.com', password: 'password123' });
            expect(res.status).toBe(201);
            expect(res.body.passwordHash).toBeUndefined();
        });
        it('should trim whitespace from email', async () => {
            const res = await request(app)
                .post('/register')
                .send({ email: '  spaced@example.com  ', password: 'password123' });
            expect(res.status).toBe(201);
            // Optionally, check the user was created with trimmed email
        });

        it('should not allow registration with an email that differs only by case', async () => {
            await request(app)
                .post('/register')
                .send({ email: 'case@example.com', password: 'password123' });

            const res = await request(app)
                .post('/register')
                .send({ email: 'CASE@example.com', password: 'password123' });

            expect(res.status).toBe(409);
        });
    });

});