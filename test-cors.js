// CORS Test - Check if Railway backend accepts Vercel frontend requests

const https = require('https');

async function testCORS() {
  console.log('🔐 CORS Configuration Test');
  console.log('===========================');
  console.log('');
  console.log('Testing: https://payza.up.railway.app/api');
  console.log('From origin: https://payza-gray.vercel.app');
  console.log('');

  return new Promise((resolve) => {
    const options = {
      hostname: 'payza.up.railway.app',
      port: 443,
      path: '/api/health',
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://payza-gray.vercel.app',
        'Access-Control-Request-Method': 'GET'
      }
    };

    const req = https.request(options, (res) => {
      console.log('Response Headers:');
      console.log('================');
      
      const corsHeaders = {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-credentials': res.headers['access-control-allow-credentials']
      };

      Object.entries(corsHeaders).forEach(([key, value]) => {
        console.log(`${key}: ${value || '(not set)'}`);
      });

      console.log('');
      
      if (corsHeaders['access-control-allow-origin'] === 'https://payza-gray.vercel.app' ||
          corsHeaders['access-control-allow-origin'] === '*') {
        console.log('✅ CORS is properly configured!');
      } else {
        console.log('⚠️  CORS might have issues. Check Railway backend variables.');
      }

      resolve();
    });

    req.on('error', (err) => {
      console.error('❌ Connection error:', err.message);
      resolve();
    });

    req.end();
  });
}

testCORS();
