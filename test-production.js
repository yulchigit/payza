// Production API Test Script
// Tests payza-gray.vercel.app with payza.up.railway.app backend

const http = require('https');
const url = require('url');

const PRODUCTION_API = 'https://payza.up.railway.app/api';
const email = `prod_test_${Date.now()}@example.com`;
const password = 'SecurePass@123';
const fullName = 'Production Test User';

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const requestUrl = new URL(PRODUCTION_API + path);
    const options = {
      hostname: requestUrl.hostname,
      port: requestUrl.port,
      path: requestUrl.pathname + requestUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testProduction() {
  console.log('🌐 PRODUCTION TEST - Railway Backend');
  console.log('====================================');
  console.log(`API: ${PRODUCTION_API}`);
  console.log(`Frontend: https://payza-gray.vercel.app`);
  console.log('');

  try {
    // 1. Register
    console.log('1️⃣ TEST: POST /auth/register');
    console.log(`   Email: ${email}`);
    
    const regRes = await makeRequest('POST', '/auth/register', {
      fullName,
      email,
      password
    });
    
    console.log(`   Status: ${regRes.status}`);
    
    if (regRes.status !== 201 || !regRes.data.success) {
      console.log(`   ❌ FAILED: ${regRes.data.error || 'Unknown error'}`);
      console.log(`   Response: ${JSON.stringify(regRes.data)}`);
      return;
    }

    const token = regRes.data.data.token;
    console.log(`   ✅ Success - Token: ${token.substring(0, 40)}...`);
    console.log('');

    // 2. Get user info
    console.log('2️⃣ TEST: GET /auth/me');
    const meRes = await makeRequest('GET', '/auth/me', null);
    meRes.headers = { 'Authorization': `Bearer ${token}` };
    
    const meRes2 = await new Promise((resolve) => {
      const requestUrl = new URL(PRODUCTION_API + '/auth/me');
      const options = {
        hostname: requestUrl.hostname,
        port: requestUrl.port,
        path: requestUrl.pathname,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              data: JSON.parse(data)
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: data
            });
          }
        });
      });

      req.on('error', resolve);
      req.end();
    });

    console.log(`   Status: ${meRes2.status}`);
    
    if (meRes2.status !== 200 || !meRes2.data.success) {
      console.log(`   ❌ FAILED: ${meRes2.data.error || 'Unknown error'}`);
      return;
    }

    console.log(`   ✅ Success - User: ${meRes2.data.data.fullName}`);
    console.log('');

    // 3. Get wallet overview
    console.log('3️⃣ TEST: GET /wallet/overview');
    
    const walletRes = await new Promise((resolve) => {
      const requestUrl = new URL(PRODUCTION_API + '/wallet/overview?limit=10');
      const options = {
        hostname: requestUrl.hostname,
        port: requestUrl.port,
        path: requestUrl.pathname + requestUrl.search,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              data: JSON.parse(data)
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: data
            });
          }
        });
      });

      req.on('error', resolve);
      req.end();
    });

    console.log(`   Status: ${walletRes.status}`);
    
    if (walletRes.status !== 200 || !walletRes.data.success) {
      console.log(`   ❌ FAILED: ${walletRes.data.error || 'Unknown error'}`);
      console.log(`   Response: ${JSON.stringify(walletRes.data)}`);
      return;
    }

    const overview = walletRes.data.data;
    console.log(`   ✅ Success`);
    console.log(`      - Traditional wallets: ${overview.traditionalBalances.length}`);
    console.log(`      - Crypto wallets: ${overview.cryptoBalances.length}`);
    console.log(`      - Payment methods: ${overview.traditionalMethods.length + overview.cryptoMethods.length}`);
    console.log('');

    console.log('🎉 PRODUCTION TEST PASSED!');
    console.log('');
    console.log('✅ Frontend: https://payza-gray.vercel.app');
    console.log('✅ Backend: https://payza.up.railway.app/api');
    console.log('✅ Database: Railway PostgreSQL');
    console.log('');
    console.log('READY FOR PRODUCTION! 🚀');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testProduction();
