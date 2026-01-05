import pool from '../../config/db';

export const sendMessage = async (sender_id: string, receiver_id: string, listing_id: string, content: string) => {
  const result = await pool.query(
    'INSERT INTO messages (sender_id, receiver_id, listing_id, content) VALUES ($1, $2, $3, $4) RETURNING *',
    [sender_id, receiver_id, listing_id, content]
  );
  return result.rows[0];
};

export const getConversations = async (user_id: string) => {
    // Fetch unique conversation threads (latest message per partner + listing)
    const result = await pool.query(
        `SELECT DISTINCT ON (partner_id, listing_id)
            m.id,
            m.content,
            m.created_at,
            m.sender_id,
            m.receiver_id,
            m.listing_id,
            l.title as listing_title,
            l.price as listing_price,
            CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END as partner_id,
            CASE WHEN m.sender_id = $1 THEN r.email ELSE s.email END as partner_email,
            CASE WHEN m.sender_id = $1 THEN r.name ELSE s.name END as partner_name
         FROM messages m
         JOIN users s ON m.sender_id = s.id
         JOIN users r ON m.receiver_id = r.id
         JOIN listings l ON m.listing_id = l.id
         WHERE m.sender_id = $1 OR m.receiver_id = $1
         ORDER BY partner_id, listing_id, m.created_at DESC`,
        [user_id]
    );
    // Sort threads by latest message time
    return result.rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const getThread = async (user_id: string, partner_id: string, listing_id: string) => {
     // Fetch full chat history between two users for a specific listing
     const result = await pool.query(
        `SELECT m.*, s.email as sender_email, s.name as sender_name
         FROM messages m
         JOIN users s ON m.sender_id = s.id
         WHERE m.listing_id = $1 
           AND ((m.sender_id = $2 AND m.receiver_id = $3) OR (m.sender_id = $3 AND m.receiver_id = $2))
         ORDER BY m.created_at ASC`,
         [listing_id, user_id, partner_id]
     );
     return result.rows;
}
