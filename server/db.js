const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'expenses.db');

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
