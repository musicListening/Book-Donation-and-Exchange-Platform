const http = require('http');
http.get('http://localhost:5000/api/admin/config', (res) => {
  console.log('statusCode:', res.statusCode);
  res.on('data', (d) => process.stdout.write(d));
}).on('error', (e) => {
  console.error(e);
});
