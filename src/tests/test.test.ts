import request from 'supertest';
import express from 'express';
import './setup'; // Ensure env is loaded

import router from '../routes/index';

const app = express();
app.use(express.json());
app.use('/', router);

describe('Health Check', () => {
    it('should return status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });
});