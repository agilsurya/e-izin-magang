const db = require('./db');

const sql = `SELECT id, student_id, lecturer_status, mentor_status, lecturer_comment, mentor_comment FROM wp_eizin_requests ORDER BY id DESC LIMIT 5`;

console.log("Checking last 5 requests in DB...");
db.query(sql, (err, results) => {
    if (err) {
        console.error("Error:", err.message);
    } else {
        console.log(JSON.stringify(results, null, 2));
    }
    process.exit(0);
});
