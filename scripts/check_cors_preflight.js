const https = require('https');

const options = {
  method: 'OPTIONS',
  hostname: 'payza-backend.onrender.com',
  path: '/api/auth/register',
  headers: {
    Origin: 'https://payza-gray.vercel.app',
    'Access-Control-Request-Method': 'POST'
  }
};

const req = https.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  console.log('HEADERS', res.headers);
  res.on('data', (d) => process.stdout.write(d.toString()));
});

req.on('error', (err) => {
  console.error('ERR', err && err.message ? err.message : err);
});

req.end();
