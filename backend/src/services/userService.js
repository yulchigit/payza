const pool = require("../db/pool");

async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT id, full_name, email, password_hash
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );
  return result.rows[0] || null;
}

async function createUser({ fullName, email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, full_name, email, created_at`,
    [fullName, email, passwordHash]
  );

  return result.rows[0];
}

module.exports = {
  findUserByEmail,
  createUser
};
