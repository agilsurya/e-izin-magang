const mysql = require('mysql2');

console.log("Attempting database connection...");

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'e_izin_magang'
});

connection.connect((err) => {
    if (err) {
        console.error('CONNECTION FAILED:');
        console.error('Code:', err.code);
        console.error('Errno:', err.errno);
        console.error('SqlMessage:', err.sqlMessage);

        if (err.code === 'ER_BAD_DB_ERROR') {
            console.log("\nPossible fix: The database 'e_izin_magang' might not exist.");
        } else if (err.code === 'ECONNREFUSED') {
            console.log("\nPossible fix: MySQL server is not running or not listening on port 3306.");
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log("\nPossible fix: Username or password incorrect.");
        }

    } else {
        console.log('SUCCESS: Connected to MySQL database!');
        console.log('Thread ID:', connection.threadId);
        connection.end();
    }
});
