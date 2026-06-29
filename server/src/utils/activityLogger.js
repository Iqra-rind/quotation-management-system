import db from "../db/connection.js";

const insertActivity = db.prepare(`
  INSERT INTO activity_log (entity_type, entity_id, action, description)
  VALUES (?, ?, ?, ?)
`);

/**
 * Records an entry in the activity log.
 * @param {string} entityType - 'vendor' | 'quotation_request' | 'quotation'
 * @param {number} entityId
 * @param {string} action - 'created' | 'updated' | 'deleted' | 'status_changed'
 * @param {string} description - human-readable description shown on the dashboard
 */
export function logActivity(entityType, entityId, action, description) {
  insertActivity.run(entityType, entityId, action, description);
}
