const http = require('http');

const options = {
  method: 'GET',
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  headers: {
    'x-forwarded-proto': 'https'
  }
};

const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  console.log('HEADERS', res.headers);
  const chunks = [];
  res.on('data', (d) => chunks.push(d));
  res.on('end', () => {
    try {
      console.log('BODY', Buffer.concat(chunks).toString());
    } catch (e) {
      console.error('PARSE_ERR', e.message);
    }
  });
});

req.on('error', (err) => {
  console.error('ERR', err.message);
});

req.end();
