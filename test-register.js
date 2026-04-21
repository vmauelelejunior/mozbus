const http = require('http');

const data = JSON.stringify({ email: 'test@mozbus.mz', password: 'test123', name: 'Test User', phone: '840000000' });

const options = {
  hostname: 'localhost',
  port: 3333,
  path: '/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, '\nBody:', body));
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();