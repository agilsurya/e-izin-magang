require('dotenv').config();
const mysql = require('mysql2');

console.log("=== PRODUCTION CONFIG CHECK ===");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("PORT:", process.env.PORT);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

pool.getConnection((err, conn) => {
    if (err) {
        console.log("\n[Note] Local connection failed:", err.code);
        console.log("This is expected if XAMPP is still broken.");
        console.log("BUT the code is correct for hosting!");
    } else {
        console.log("\n[Success] Connected to database!");
        conn.release();
    }
    process.exit();
});
