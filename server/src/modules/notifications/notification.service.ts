import pool from '../../config/db';

export const createNotification = async (user_id: string, type: string, title: string, message: string, link: string) => {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, link) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [user_id, type, title, message, link]
  );
  return result.rows[0];
};

export const getUserNotifications = async (user_id: string) => {
  const result = await pool.query(
    `SELECT * FROM notifications 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT 50`,
    [user_id]
  );
  return result.rows;
};

export const markAsRead = async (notification_id: string, user_id: string) => {
    const result = await pool.query(
        `UPDATE notifications 
         SET is_read = TRUE 
         WHERE id = $1 AND user_id = $2 
         RETURNING *`,
        [notification_id, user_id]
    );
    return result.rows[0];
};

export const markAllAsRead = async (user_id: string) => {
    await pool.query(
        `UPDATE notifications 
         SET is_read = TRUE 
         WHERE user_id = $1`,
        [user_id]
    );
    return { success: true };
};
