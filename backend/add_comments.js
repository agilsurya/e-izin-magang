const db = require('./db');

const alterSql = `
    ALTER TABLE wp_eizin_requests 
    ADD COLUMN lecturer_comment TEXT DEFAULT NULL,
    ADD COLUMN mentor_comment TEXT DEFAULT NULL
`;

console.log("Adding comment columns...");
db.query(alterSql, (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Columns already exist.");
        } else {
            console.error("Error altering table:", err.message);
        }
    } else {
        console.log("Table altered successfully.");
    }
    process.exit(0);
});
