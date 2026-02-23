#!/usr/bin/env node
/* eslint-disable no-console */
const crypto = require("crypto");

const length = 64;
const secret = crypto.randomBytes(length).toString("base64url").slice(0, length);

console.log(secret);
