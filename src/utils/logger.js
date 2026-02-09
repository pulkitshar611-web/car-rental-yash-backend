const pool = require('../config/db');

const logAction = async (userId, action, targetTable, targetId, oldValue = null, newValue = null) => {
    try {
        const query = `
      INSERT INTO AuditLogs (user_id, action, target_table, target_id, old_value, new_value)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        await pool.execute(query, [
            userId,
            action,
            targetTable,
            targetId,
            oldValue ? JSON.stringify(oldValue) : null,
            newValue ? JSON.stringify(newValue) : null
        ]);
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

module.exports = { logAction };
