const pool = require("../db/pool");

const mapFavoriteRecipient = (row) => ({
  id: row.id,
  recipientName: row.recipient_name,
  recipientIdentifier: row.recipient_identifier,
  lastUsedAt: row.last_used_at,
  createdAt: row.created_at
});

async function listFavoriteRecipients(userId, limit) {
  const result = await pool.query(
    `SELECT id, recipient_name, recipient_identifier, last_used_at, created_at
     FROM recipient_favorites
     WHERE user_id = $1
     ORDER BY last_used_at DESC
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows.map(mapFavoriteRecipient);
}

async function upsertFavoriteRecipient({ userId, recipientName, recipientIdentifier }) {
  const normalizedIdentifier = recipientIdentifier.trim();
  const normalizedName =
    typeof recipientName === "string" && recipientName.trim().length > 0
      ? recipientName.trim()
      : normalizedIdentifier;

  const result = await pool.query(
    `INSERT INTO recipient_favorites (user_id, recipient_name, recipient_identifier, last_used_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     ON CONFLICT (user_id, recipient_identifier)
     DO UPDATE SET
       recipient_name = EXCLUDED.recipient_name,
       last_used_at = NOW(),
       updated_at = NOW()
     RETURNING id, recipient_name, recipient_identifier, last_used_at, created_at`,
    [userId, normalizedName, normalizedIdentifier]
  );

  return mapFavoriteRecipient(result.rows[0]);
}

async function deleteFavoriteRecipient({ userId, favoriteId }) {
  const result = await pool.query(
    `DELETE FROM recipient_favorites
     WHERE user_id = $1 AND id = $2`,
    [userId, favoriteId]
  );

  return result.rowCount > 0;
}

module.exports = {
  listFavoriteRecipients,
  upsertFavoriteRecipient,
  deleteFavoriteRecipient
};
