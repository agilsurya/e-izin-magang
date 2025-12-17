const http = require('http');

const data = JSON.stringify({
    identifier: '12345',
    password: '123'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/e-izin/v1/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("Testing Login API with Mock Credentials...");

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('RESPONSE:', body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
