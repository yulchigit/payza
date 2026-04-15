#!/usr/bin/env node
/**
 * Generate a secure random JWT_SECRET for production use
 * Usage: node scripts/generate-jwt-secret.js
 */

const crypto = require('crypto');

// Generate 64 random characters (512 bits / 8 = 64 bytes → 64 chars in hex)
const secret = crypto.randomBytes(64).toString('hex');

console.log('\n✅ JWT_SECRET generated successfully:\n');
console.log(secret);
console.log('\n📋 Add this to your environment variables:\n');
console.log('JWT_SECRET=' + secret);
console.log('\n');
