const fs = require("fs");
const path = require("path");
const pool = require("../src/db/pool");

async function run() {
  const sqlDir = path.resolve(__dirname, "../sql");
  const files = fs
    .readdirSync(sqlDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found.");
    return;
  }

  console.log(`Running ${files.length} migrations...`);

  for (const file of files) {
    const fullPath = path.join(sqlDir, file);
    const sql = fs.readFileSync(fullPath, "utf8");
    console.log(`- ${file}`);
    await pool.query(sql);
  }

  console.log("Migrations completed successfully.");
}

run()
  .catch((error) => {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
