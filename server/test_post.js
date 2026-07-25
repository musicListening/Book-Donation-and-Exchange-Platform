const http = require('http');

const data = JSON.stringify({
  userId: '12345',
  rating: 5,
  comment: 'Great'
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/reviews',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
