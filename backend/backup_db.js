const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const DB_NAME = 'e_izin_magang';
const DB_USER = 'root';
const DB_PASS = ''; // Default XAMPP password
const MYSQLDUMP_PATH = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
const OUTPUT_FILE = path.join(__dirname, '../database.sql');

if (!fs.existsSync(MYSQLDUMP_PATH)) {
    console.error(`Error: mysqldump not found at ${MYSQLDUMP_PATH}`);
    process.exit(1);
}

const command = `"${MYSQLDUMP_PATH}" -u ${DB_USER} --databases ${DB_NAME} > "${OUTPUT_FILE}"`;

console.log(`Backing up database '${DB_NAME}' to '${OUTPUT_FILE}'...`);

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Backup failed: ${error.message}`);
        return;
    }
    if (stderr) {
        // mysqldump writes info to stderr, which is normal, but let's check
        // console.warn(`stderr: ${stderr}`);
    }
    console.log(`Backup Successful! File updated: ${OUTPUT_FILE}`);
});
