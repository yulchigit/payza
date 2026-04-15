const http = require('http');

const options = {
  method: 'OPTIONS',
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  headers: {
    Origin: 'https://payza-gray.vercel.app',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type, Authorization'
  }
};

const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  console.log('HEADERS', res.headers);
  const chunks = [];
  res.on('data', (d) => chunks.push(d));
  res.on('end', () => {
    console.log('BODY', Buffer.concat(chunks).toString());
  });
});

req.on('error', (err) => {
  console.error('ERR', err.message);
});

req.end();
