const http = require('http');

const rand = 'test' + Math.random().toString(36).substring(7);
const payload = JSON.stringify({
  email: rand + '@test.mz',
  password: 'test12345',
  name: 'Test User',
  phone: '840000999'
});

const opts = {
  hostname: 'localhost',
  port: 3333,
  path: '/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};

const req = http.request(opts, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', data);
    try {
      const j = JSON.parse(data);
      if (j.access_token) {
        console.log('✅ SUCCESS! Token:', j.access_token?.substring(0, 30) + '...');
        console.log('User:', j.user);
      }
    } catch(e) {
      console.log('Parse error');
    }
  });
});

req.on('error', e => console.log('ERROR:', e.message));
req.write(payload);
req.end();