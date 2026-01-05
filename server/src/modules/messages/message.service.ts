import pool from '../../config/db';

export const sendMessage = async (sender_id: string, receiver_id: string, listing_id: string, content: string) => {
  const result = await pool.query(
    'INSERT INTO messages (sender_id, receiver_id, listing_id, content) VALUES ($1, $2, $3, $4) RETURNING *',
    [sender_id, receiver_id, listing_id, content]
  );
  return result.rows[0];
};

export const getConversations = async (user_id: string) => {
    // Get distinct conversations. This is a bit complex SQL to group by conversation partner.
    // For MVP, just fetching all messages where user is sender or receiver
    const result = await pool.query(
        `SELECT m.*, 
            s.email as sender_email, 
            r.email as receiver_email,
            l.title as listing_title
         FROM messages m
         JOIN users s ON m.sender_id = s.id
         JOIN users r ON m.receiver_id = r.id
         LEFT JOIN listings l ON m.listing_id = l.id
         WHERE m.sender_id = $1 OR m.receiver_id = $1
         ORDER BY m.created_at DESC`,
        [user_id]
    );
    return result.rows;
};

export const getMessagesForListing = async (user_id: string, listing_id: string) => {
     // Fetch messages for a specific listing between current user and others
     // Simplified for MVP
     const result = await pool.query(
        `SELECT * FROM messages 
         WHERE listing_id = $1 AND (sender_id = $2 OR receiver_id = $2)
         ORDER BY created_at ASC`,
         [listing_id, user_id]
     );
     return result.rows;
}
