const mysql = require('mysql2');

const configs = [
    { label: 'Default XAMPP (localhost, no pass)', host: 'localhost', user: 'root', password: '' },
    { label: 'IP Fix (127.0.0.1, no pass)', host: '127.0.0.1', user: 'root', password: '' },
    { label: 'MAMP/Alt (localhost, root pass)', host: 'localhost', user: 'root', password: 'root' },
    { label: 'IP + Pass (127.0.0.1, root pass)', host: '127.0.0.1', user: 'root', password: 'root' }
];

async function testConnection(config) {
    return new Promise((resolve) => {
        console.log(`\nTesting: ${config.label}...`);
        const connection = mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            database: 'e_izin_magang'
        });

        connection.connect((err) => {
            if (err) {
                console.log(`[FAILED] ${err.code} - ${err.sqlMessage}`);
                connection.end();
                resolve(false);
            } else {
                console.log(`[SUCCESS] Connected! Thread ID: ${connection.threadId}`);
                connection.end();
                resolve(true);
            }
        });
    });
}

async function runTests() {
    console.log("Starting Robust Connection Tests...");
    for (const config of configs) {
        const success = await testConnection(config);
        if (success) {
            console.log("\n!!! FOUND WORKING CONFIGURATION !!!");
            console.log(JSON.stringify(config, null, 2));
            return;
        }
    }
    console.log("\n[SUMMARY] All common configurations failed.");
}

runTests();
