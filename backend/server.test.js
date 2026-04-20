import request from 'supertest';
import express from 'express';

const app = express();
app.use(express.json());
app.post('/chat', (req, res) => {
    if (!req.body.message) return res.status(400).json({ error: 'Message required' });
    res.json({ reply: 'Mock response' });
});

describe('Chat API', () => {
    it('should return 400 if message is missing', async () => {
        const res = await request(app).post('/chat').send({});
        expect(res.statusCode).toBe(400);
    });

    it('should process a valid message', async () => {
        const res = await request(app).post('/chat').send({ message: 'Hello' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('reply');
    });
});
