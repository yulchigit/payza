const https = require('https');
const fs = require('fs');

const options = {
  method: 'OPTIONS',
  hostname: 'payza-backend.onrender.com',
  path: '/api/auth/register',
  headers: {
    Origin: 'https://payza-gray.vercel.app',
    'Access-Control-Request-Method': 'POST'
  }
};

const out = { ts: new Date().toISOString() };

const req = https.request(options, (res) => {
  out.status = res.statusCode;
  out.headers = res.headers;
  const chunks = [];
  res.on('data', (d) => chunks.push(d));
  res.on('end', () => {
    out.body = Buffer.concat(chunks).toString();
    fs.writeFileSync('scripts/cors_result.json', JSON.stringify(out, null, 2));
    console.log('WROTE scripts/cors_result.json');
  });
});

req.on('error', (err) => {
  out.error = (err && err.message) || String(err);
  fs.writeFileSync('scripts/cors_result.json', JSON.stringify(out, null, 2));
  console.log('WROTE scripts/cors_result.json (error)');
});

req.end();
