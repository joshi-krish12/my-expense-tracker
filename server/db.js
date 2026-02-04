const sqlite3 = require('sqlite3').verbose();
const os = require('os');
const path = require('path');

// Determine if running on Vercel (or just assume /tmp for non-local validity if needed, but safe to check env)
// Vercel sets 'VERCEL' env var to '1'.
const isVercel = process.env.VERCEL === '1';

const dbPath = isVercel 
    ? path.join('/tmp', 'expenses.db') 
    : path.resolve(__dirname, 'expenses.db');

console.log('Using database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

const initDb = () => {
    db.run(`CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        idempotency_key TEXT UNIQUE
    )`, (err) => {
        if (err) {
            console.error('Error creating expenses table', err);
        } else {
            console.log('Expenses table ready');
        }
    });
};

initDb();

module.exports = db;
