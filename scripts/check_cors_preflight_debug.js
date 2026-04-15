const https = require('https');
const fs = require('fs');
const path = require('path');

const outPath = path.resolve(__dirname, 'cors_result_debug.json');
const options = {
  method: 'OPTIONS',
  hostname: 'payza-backend.onrender.com',
  path: '/api/auth/register',
  headers: {
    Origin: 'https://payza-gray.vercel.app',
    'Access-Control-Request-Method': 'POST'
  }
};

const out = { ts: new Date().toISOString(), options };

const req = https.request(options, (res) => {
  out.status = res.statusCode;
  out.headers = res.headers;
  const chunks = [];
  res.on('data', (d) => chunks.push(d));
  res.on('end', () => {
    out.body = Buffer.concat(chunks).toString();
    try {
      fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
      console.log('WROTE', outPath);
    } catch (err) {
      console.error('WRITE_ERR', err && err.message);
      console.log(JSON.stringify(out, null, 2));
    }
  });
});

req.on('error', (err) => {
  out.error = (err && err.message) || String(err);
  try {
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
    console.log('WROTE ERROR', outPath);
  } catch (err2) {
    console.error('WRITE_ERR2', err2 && err2.message);
    console.log(JSON.stringify(out, null, 2));
  }
});

req.end();
