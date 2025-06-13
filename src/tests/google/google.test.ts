import request from 'supertest';
import express from 'express';
import router from '../../routes';
import '../setup';

const app = express();
app.use(express.json());
app.use('/', router);

describe('GET /google', () => {
    it('should redirect to Google OAuth', async () => {
        const res = await request(app).get('/google');
        expect(res.status).toBe(302);
        expect(res.headers.location).toMatch(/^https:\/\/accounts\.google\.com/);
    });
});