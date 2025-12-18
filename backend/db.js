const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool instead of a single connection
// This handles lost connections, timeouts, and concurrent requests much better
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'e_izin_magang',
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0
});

// Test the connection on startup
// Test the connection on startup - DISABLED FOR VERCEL (Prevent Cold Start Issue)
/*
pool.getConnection((err, connection) => {
    if (err) {
        console.error('[DB ERROR] Database connection failed:', err.code);
        console.error('Please check your .env configuration and database server status.');
    } else {
        console.log('[DB] Connected to MySQL database pool.');
        connection.release();
    }
});
*/

module.exports = pool;
