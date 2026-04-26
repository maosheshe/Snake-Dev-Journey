const jwt = require('jsonwebtoken');
const http = require('http');

const secret = 'your_secure_jwt_secret_key';
const token = jwt.sign(
    { userId: 101, username: 'admin', role: 'admin' }, // Use valid ID 101
    secret
);

const data = JSON.stringify({
    title: 'Test Update Invalid Image',
    content: 'Testing invalid image URL on update...',
    coverUrl: 'http://this-does-not-exist.invalid/img.jpg',
    category: '技术',
    tags: 'test',
    displayMode: 'markdown'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/articles/1257', // Article created earlier
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => {
        responseBody += chunk;
    });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', responseBody);
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.write(data);
req.end();
