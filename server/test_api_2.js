const http = require('http');
http.get('http://localhost:5000/api/mystery-boxes/user/e5a973c2-46f5-4564-9575-f6d3a21e82d8', (res) => {
  console.log('statusCode:', res.statusCode);
  res.on('data', (d) => process.stdout.write(d));
}).on('error', (e) => {
  console.error(e);
});
