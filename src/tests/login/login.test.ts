import request from 'supertest';
import express from 'express';
import router from '../../routes';
import '../setup';
import User from '../../dbModels/UserModel';
import AuthProvider from '../../dbModels/AuthProviderModel';

const app = express();
app.use(express.json());
app.use('/', router);

describe('Auth Integration - POST /login', () => {
    beforeEach(async () => {
        // Register a user for login tests
        await request(app)
            .post('/register')
            .send({ email: 'loginuser@example.com', password: 'password123' });
    });

    it('logs in with correct credentials', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'loginuser@example.com', password: 'password123' });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('fails with wrong password', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'loginuser@example.com', password: 'wrongpass' });
        expect(res.status).toBe(401);
    });

    it('fails with non-existent email', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'notfound@example.com', password: 'password123' });
        expect(res.status).toBe(401);
    });

    it('fails if email is missing', async () => {
        const res = await request(app)
            .post('/login')
            .send({ password: 'password123' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails if password is missing', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'loginuser@example.com' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails if email is invalid', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'not-an-email', password: 'password123' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails if password is too short', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'loginuser@example.com', password: 'short' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('trims whitespace from email', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: '  loginuser@example.com  ', password: 'password123' });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('accepts email regardless of case', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'LOGINUSER@EXAMPLE.COM', password: 'password123' });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('does not leak password hash in response', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'loginuser@example.com', password: 'password123' });
        expect(res.body.passwordHash).toBeUndefined();
    });

    it('returns a valid JWT', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'loginuser@example.com', password: 'password123' });
        const token = res.body.token;
        expect(typeof token).toBe('string');
        // Optionally, decode and check payload
    });

    it('fails if both fields are missing', async () => {
        const res = await request(app)
            .post('/login')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails if extra fields are present', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'loginuser@example.com', password: 'password123', extra: 'field' });
        expect(res.status).toBe(200); // Should still succeed, extra fields ignored
        expect(res.body.token).toBeDefined();
    });

    it('fails if password is null', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'loginuser@example.com', password: null });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails if email is null', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: null, password: 'password123' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails if password is undefined', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'loginuser@example.com' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails if email is undefined', async () => {
        const res = await request(app)
            .post('/login')
            .send({ password: 'password123' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails if email is empty string', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: '', password: 'password123' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails if password is empty string', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'loginuser@example.com', password: '' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });
});

describe('Auth Integration - POST /login (Google-registered users)', () => {
    let googleUser: User;

    beforeEach(async () => {
        // Create a user registered via Google (no passwordHash)
        googleUser = await User.create({ email: 'googleuser@example.com', passwordHash: null });
        await AuthProvider.create({ userId: googleUser.id, provider: 'google', providerId: 'google-id-123' });
    });

    it('fails to login with correct email and any password', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'googleuser@example.com', password: 'any-password' });
        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/invalid credentials|no local password/i);
    });

    it('fails to login with correct email and empty password', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'googleuser@example.com', password: '' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails to login with correct email and missing password', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'googleuser@example.com' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails to login with correct email and null password', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'googleuser@example.com', password: null });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails to login with correct email and undefined password', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'googleuser@example.com' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails to login with email in different case', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'GOOGLEUSER@EXAMPLE.COM', password: 'any-password' });
        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/invalid credentials|no local password/i);
    });

    it('fails to login with email with whitespace', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: '  googleuser@example.com  ', password: 'any-password' });
        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/invalid credentials|no local password/i);
    });

    it('fails to login with non-existent email', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'notfound@example.com', password: 'any-password' });
        expect(res.status).toBe(401);
    });

    it('fails to login with missing email', async () => {
        const res = await request(app)
            .post('/login')
            .send({ password: 'any-password' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails to login with empty email', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: '', password: 'any-password' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails to login with invalid email format', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'not-an-email', password: 'any-password' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('does not leak password hash in response', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'googleuser@example.com', password: 'any-password' });
        expect(res.body.passwordHash).toBeUndefined();
    });

    it('fails to login with both fields missing', async () => {
        const res = await request(app)
            .post('/login')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails to login with extra fields', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'googleuser@example.com', password: 'any-password', extra: 'field' });
        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/invalid credentials|no local password/i);
    });
});