import request from 'supertest';
import express from 'express';
import router from '../../routes';
import '../setup';
import serviceConfig from '../../config/config';
import User from '../../dbModels/UserModel';
import AuthProvider from '../../dbModels/AuthProviderModel';

const app = express();
app.use(express.json());
app.use('/', router);

let token: string;

beforeEach(async () => {
    // Register and login a user to get a JWT
    await request(app)
        .post('/register')
        .send({ email: 'changepass@example.com', password: 'oldpassword123' });

    const res = await request(app)
        .post('/login')
        .send({ email: 'changepass@example.com', password: 'oldpassword123' });

    token = res.body.token;
});

describe('POST /change-password', () => {
    it('changes password with correct old password', async () => {
        const res = await request(app)
            .post('/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({ oldPassword: 'oldpassword123', newPassword: 'newpassword456' });
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/success/i);

        // Should be able to login with new password
        const loginRes = await request(app)
            .post('/login')
            .send({ email: 'changepass@example.com', password: 'newpassword456' });
        expect(loginRes.status).toBe(200);
        expect(loginRes.body.token).toBeDefined();
    });

    it('fails with wrong old password', async () => {
        const res = await request(app)
            .post('/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({ oldPassword: 'wrongpassword', newPassword: 'newpassword456' });
        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/old password is incorrect/i);
    });

    it('fails if not authenticated', async () => {
        const res = await request(app)
            .post('/change-password')
            .send({ oldPassword: 'oldpassword123', newPassword: 'newpassword456' });
        expect(res.status).toBe(401);
    });

    it('fails if oldPassword is missing', async () => {
        const res = await request(app)
            .post('/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({ newPassword: 'newpassword456' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails if newPassword is missing', async () => {
        const res = await request(app)
            .post('/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({ oldPassword: 'oldpassword123' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails if newPassword is too short', async () => {
        const res = await request(app)
            .post('/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({ oldPassword: 'oldpassword123', newPassword: 'short' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails if oldPassword is empty', async () => {
        const res = await request(app)
            .post('/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({ oldPassword: '', newPassword: 'newpassword456' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails if newPassword is empty', async () => {
        const res = await request(app)
            .post('/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({ oldPassword: 'oldpassword123', newPassword: '' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('fails if user has no local password (e.g., Google user)', async () => {
        // Register a Google user (simulate)
        const googleUser = await User.create({ email: 'googleonly@example.com', passwordHash: null });
        await AuthProvider.create({ userId: googleUser.id, provider: 'google', providerId: 'google-id-456' });

        // Login to get a token (simulate JWT for this user)
        const jwt = require('jsonwebtoken');
        const fakeToken = jwt.sign({ userId: googleUser.id }, serviceConfig.JWT_SECRET);

        const res = await request(app)
            .post('/change-password')
            .set('Authorization', `Bearer ${fakeToken}`)
            .send({ oldPassword: 'anything', newPassword: 'newpassword456' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/no local password/i);
    });
});