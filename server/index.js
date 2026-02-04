const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// GET /expenses
app.get('/expenses', (req, res) => {
    const { category, sort } = req.query;
    let query = 'SELECT * FROM expenses';
    const params = [];

    if (category) {
        query += ' WHERE category = ?';
        params.push(category);
    }

    if (sort === 'date_desc') {
        query += ' ORDER BY date DESC';
    } else {
        // Default sort by created_at desc if not specified, or just let DB decide.
        // Spec says "User can sort by date", implies default might be arbitrary or insertion order.
        // Let's default to created_at desc for better UX if no specific sort.
        query += ' ORDER BY created_at DESC';
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(rows);
    });
});

// POST /expenses
app.post('/expenses', (req, res) => {
    const { amount, category, description, date } = req.body;
    // Idempotency Key validation
    // The client should send this key. If missing, we can generate one (but that defeats the purpose of client retries).
    // For this exercise, we'll assume the client MUST send it, or we treat it as a fresh request if strictly following standard API practices where Idempotency-Key is a header.
    // However, the prompt says "The API should behave correctly even if the client retries the same request".
    // I'll look for `idempotencyKey` in the body or `Idempotency-Key` header.
    
    // For simplicity in this "minimal" tool, I'll check the body property mainly as I'll control the frontend.
    const idempotencyKey = req.body.idempotencyKey || req.get('Idempotency-Key');

    if (!amount || !category || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!idempotencyKey) {
        // If strict idempotency is required, we might error, but here we can just proceed as a normal non-idempotent create if we wanted.
        // But to pass the "retry" requirement robustly, I'll generate one if missing but that doesn't protect against retries of the *same* payload if the network dropped the response.
        // Actually, if the client retries the same request (same body), and provides an idempotency key, we are good.
        // If they don't provide one, identical expenses might be created.
        // I will REQUIRE it for this implementation to effectively demonstrate the requirement.
        return res.status(400).json({ error: 'Idempotency-Key is required' });
    }

    // Check if key exists
    db.get('SELECT * FROM expenses WHERE idempotency_key = ?', [idempotencyKey], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (row) {
            // Found existing, return it (idempotent success)
            return res.json(row);
        }

        // Create new
        const id = uuidv4();
        const created_at = new Date().toISOString();

        const insertQuery = `INSERT INTO expenses (id, amount, category, description, date, created_at, idempotency_key) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(insertQuery, [id, amount, category, description || '', date, created_at, idempotencyKey], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    // Race condition caught
                     db.get('SELECT * FROM expenses WHERE idempotency_key = ?', [idempotencyKey], (err, row) => {
                         if (!err && row) return res.json(row);
                         return res.status(500).json({ error: 'Concurrent Error' });
                     });
                     return;
                }
                console.error(err);
                return res.status(500).json({ error: 'Failed to create expense' });
            }

            // Return the newly created object
            res.status(201).json({
                id,
                amount,
                category,
                description: description || '',
                date,
                created_at,
                idempotency_key: idempotencyKey
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
