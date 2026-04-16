// StAuth10244: I Dylan Nguyen, 000949131 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else.

const logger = require('./utils/logger');
const { createClient } = require('redis');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const client = createClient();
const TODO_KEY = 'todo_items';

// Initialize Redis client connection
async function initializeRedis() {
    client.on('error', (err) => logger.error('Redis Client Error', err));
    await client.connect();
    // Initialize empty TODO list if it doesn't exist
    const exists = await client.exists(TODO_KEY);
    if (!exists) {
        await client.set(TODO_KEY, JSON.stringify([]));
        logger.info('Initialized empty TODO list in Redis');
    }
}

initializeRedis().catch(err => logger.error('Failed to initialize Redis', err));

// Load route - GET /load
// Returns JSON array of TODO items from Redis
app.get('/load', async (req, res) => {
    try {
        const items = await client.get(TODO_KEY);
        const todoList = items ? JSON.parse(items) : [];
        logger.info(`Loaded ${todoList.length} TODO items`);
        res.json(todoList);
    } catch (err) {
        logger.error('Error loading TODO items:', err);
        res.status(500).json({ error: 'Failed to load TODO items' });
    }
});

// Save route - POST /save
// Saves TODO list array to Redis, replacing existing data
app.post('/save', async (req, res) => {
    try {
        const todoList = req.body;
        await client.set(TODO_KEY, JSON.stringify(todoList));
        logger.info(`Saved ${todoList.length} TODO items`);
        res.json({ status: 'save successful' });
    } catch (err) {
        logger.error('Error saving TODO items:', err);
        res.status(500).json({ error: 'Failed to save TODO items' });
    }
});

// Clear route - GET /clear
// Clears all TODO items in Redis
app.get('/clear', async (req, res) => {
    try {
        await client.set(TODO_KEY, JSON.stringify([]));
        logger.info('Cleared TODO list');
        res.json({ status: 'clear successful' });
    } catch (err) {
        logger.error('Error clearing TODO items:', err);
        res.status(500).json({ error: 'Failed to clear TODO items' });
    }
});

// Port Listening
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});