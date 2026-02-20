const pool = require("../db/pool");

async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT id, full_name, email, password_hash, failed_login_attempts, locked_until
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

async function recordFailedLoginAttempt({ userId, maxAttempts, lockMinutes }) {
  const result = await pool.query(
    `UPDATE users
     SET failed_login_attempts = failed_login_attempts + 1,
         locked_until = CASE
           WHEN failed_login_attempts + 1 >= $2
             THEN NOW() + ($3::text || ' minutes')::interval
           ELSE locked_until
         END,
         updated_at = NOW()
     WHERE id = $1
     RETURNING failed_login_attempts, locked_until`,
    [userId, maxAttempts, lockMinutes]
  );

  return result.rows[0] || null;
}

async function clearLoginSecurityState(userId) {
  await pool.query(
    `UPDATE users
     SET failed_login_attempts = 0,
         locked_until = NULL,
         last_login_at = NOW(),
         updated_at = NOW()
     WHERE id = $1`,
    [userId]
  );
}

async function createAuthAuditLog({ userId, email, eventType, isSuccess, failureReason, ipAddress, userAgent }) {
  await pool.query(
    `INSERT INTO auth_audit_logs (
      user_id,
      email,
      event_type,
      is_success,
      failure_reason,
      ip_address,
      user_agent
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId || null, email || null, eventType, isSuccess, failureReason || null, ipAddress || null, userAgent || null]
  );
}

module.exports = {
  findUserByEmail,
  createUser,
  recordFailedLoginAttempt,
  clearLoginSecurityState,
  createAuthAuditLog
};
