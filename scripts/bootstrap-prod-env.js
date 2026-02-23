#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

const files = [
  {
    source: path.join(projectRoot, ".env.production.example"),
    target: path.join(projectRoot, ".env.production")
  },
  {
    source: path.join(projectRoot, "backend", ".env.production.example"),
    target: path.join(projectRoot, "backend", ".env.production")
  }
];

let created = 0;

for (const file of files) {
  if (!fs.existsSync(file.source)) {
    console.error(`Missing source template: ${path.relative(projectRoot, file.source)}`);
    process.exit(1);
  }

  if (fs.existsSync(file.target)) {
    console.log(`Skip (already exists): ${path.relative(projectRoot, file.target)}`);
    continue;
  }

  fs.copyFileSync(file.source, file.target);
  created += 1;
  console.log(`Created: ${path.relative(projectRoot, file.target)}`);
}

if (created === 0) {
  console.log("No files created. Production env files already exist.");
} else {
  console.log("Production env bootstrap completed.");
}
