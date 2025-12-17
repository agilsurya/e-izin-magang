const db = require('./db');

const sql = `ALTER TABLE wp_eizin_requests ADD COLUMN approved_at DATETIME NULL`;

console.log("Adding approved_at column...");
db.query(sql, (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists.");
        } else {
            console.error("Error:", err.message);
        }
    } else {
        console.log("Column added successfully.");
    }
    process.exit(0);
});
