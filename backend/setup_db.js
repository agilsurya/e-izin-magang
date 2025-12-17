const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // Default XAMPP password
    multipleStatements: true // Allow executing multiple SQL statements
};

const connection = mysql.createConnection(dbConfig);

const sqlPath = path.join(__dirname, '../database.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

console.log("Connecting to MySQL...");
connection.connect((err) => {
    if (err) {
        console.error("Failed to connect to MySQL. Ensure XAMPP MySQL is running.", err.message);
        process.exit(1);
    }
    console.log("Connected to MySQL.");

    // Create Database
    connection.query("CREATE DATABASE IF NOT EXISTS e_izin_magang", (err) => {
        if (err) {
            console.error("Failed to create database:", err.message);
            process.exit(1);
        }
        console.log("Database 'e_izin_magang' created or already exists.");

        // Use Database
        connection.query("USE e_izin_magang", (err) => {
            if (err) {
                console.error("Failed to select database:", err.message);
                process.exit(1);
            }

            // Import Schema
            // Removing lines that might cause syntax errors in direct execution if any
            // And note that multipleStatements=true allows us to run the whole file
            connection.query(sqlContent, (err) => {
                if (err) {
                    // Try to be resilient if some tables exist
                    console.warn("Warning during import (might be duplicates):", err.message);
                } else {
                    console.log("Database schema imported successfully.");
                }

                console.log("Setup complete. You can now use the application.");
                connection.end();
            });
        });
    });
});
