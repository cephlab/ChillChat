// sqlite.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'chat.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Table des messages existante
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room TEXT NOT NULL,
            username TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        // Nouvelle table pour les utilisateurs
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`, (err) => {
            if(err) console.error("Error creating users table: ", err.message);
        });
    }
});

const insertMessage = (room, username, message) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO messages (room, username, message) VALUES (?, ?, ?)';
        db.run(sql, [room, username, message], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID });
            }
        });
    });
};

const getMessagesByRoom = (room) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM messages WHERE room = ? ORDER BY timestamp ASC';
        db.all(sql, [room], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

module.exports = {
    db,
    insertMessage,
    getMessagesByRoom
};
