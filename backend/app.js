// StAuth10244: I Dylan Nguyen, 000949131 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else.

const logger = require('./utils/logger');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'items.db');
let db;

async function initializeDatabase() {
    fs.mkdirSync(DB_DIR, { recursive: true });

    db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database,
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL
        );
    `);

    logger.info(`SQLite database ready at ${DB_PATH}`);
}

function normalizeItem(row) {
    const parsed = JSON.parse(row.data);

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return { id: row.id, ...parsed };
    }

    return { id: row.id, value: parsed };
}

async function getAllItems() {
    const rows = await db.all('SELECT id, data FROM items ORDER BY id ASC');
    return rows.map(normalizeItem);
}

async function replaceCollection(items) {
    await db.exec('BEGIN TRANSACTION');

    try {
        await db.run('DELETE FROM items');

        for (const item of items) {
            await db.run('INSERT INTO items (data) VALUES (?)', JSON.stringify(item));
        }

        await db.exec('COMMIT');
    } catch (err) {
        await db.exec('ROLLBACK');
        throw err;
    }
}

// Collection routes
app.get('/api/', async (req, res) => {
    try {
        const items = await getAllItems();
        res.json(items);
    } catch (err) {
        logger.error('Error getting collection:', err);
        res.status(500).json({ error: 'Failed to get collection' });
    }
});

app.put('/api/', async (req, res) => {
    try {
        const items = req.body;

        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'Request body must be a JSON array' });
        }

        await replaceCollection(items);
        res.json({ status: 'REPLACE COLLECTION SUCCESSFUL' });
    } catch (err) {
        logger.error('Error replacing collection:', err);
        res.status(500).json({ error: 'Failed to replace collection' });
    }
});

app.post('/api/', async (req, res) => {
    try {
        const item = req.body;

        if (!item || typeof item !== 'object' || Array.isArray(item)) {
            return res.status(400).json({ error: 'Request body must be a JSON object' });
        }

        await db.run('INSERT INTO items (data) VALUES (?)', JSON.stringify(item));
        res.json({ status: 'CREATE ENTRY SUCCESSFUL' });
    } catch (err) {
        logger.error('Error creating item:', err);
        res.status(500).json({ error: 'Failed to create item' });
    }
});

app.delete('/api/', async (req, res) => {
    try {
        await db.run('DELETE FROM items');
        res.json({ status: 'DELETE COLLECTION SUCCESSFUL' });
    } catch (err) {
        logger.error('Error deleting collection:', err);
        res.status(500).json({ error: 'Failed to delete collection' });
    }
});

// Item routes
app.get('/api/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Invalid id' });
        }

        const row = await db.get('SELECT id, data FROM items WHERE id = ?', id);

        if (!row) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(normalizeItem(row));
    } catch (err) {
        logger.error('Error getting item:', err);
        res.status(500).json({ error: 'Failed to get item' });
    }
});

app.put('/api/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const item = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Invalid id' });
        }

        if (!item || typeof item !== 'object' || Array.isArray(item)) {
            return res.status(400).json({ error: 'Request body must be a JSON object' });
        }

        const result = await db.run('UPDATE items SET data = ? WHERE id = ?', JSON.stringify(item), id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({ status: 'UPDATE ITEM SUCCESSFUL' });
    } catch (err) {
        logger.error('Error updating item:', err);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

app.delete('/api/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Invalid id' });
        }

        const result = await db.run('DELETE FROM items WHERE id = ?', id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({ status: 'DELETE ITEM SUCCESSFUL' });
    } catch (err) {
        logger.error('Error deleting item:', err);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

async function startServer() {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        logger.error('Failed to initialize database', err);
        process.exit(1);
    }
}

startServer();