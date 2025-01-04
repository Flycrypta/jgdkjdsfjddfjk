import express from 'express';
import cors from 'cors';
import { dbManager } from '../database.js';

const app = express();
app.use(cors());
app.use(express.json());

// Basic authentication middleware
const authMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Apply auth middleware to all routes
app.use(authMiddleware);

// Database endpoints
app.get('/user/:id', async (req, res) => {
    try {
        const user = await dbManager.getUser(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/user/:id/coins', async (req, res) => {
    try {
        const { amount } = req.body;
        await dbManager.updateCoins(req.params.id, amount);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`API server running on http://172.86.108.64:${PORT}`);
});
