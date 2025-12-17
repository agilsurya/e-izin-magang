const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'e_izin_magang'
});

connection.connect();

connection.query('SELECT * FROM wp_eizin_users', (err, rows) => {
    if (err) {
        console.error("Query Error:", err.message);
    } else {
        console.log("--- USERS JSON ---");
        console.log(JSON.stringify(rows, null, 2));
    }
    connection.end();
});
