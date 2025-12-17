const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'debug.log');

const log = (message) => {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFile, line);
};

module.exports = { log };
