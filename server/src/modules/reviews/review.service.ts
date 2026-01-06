import pool from '../../config/db';

export const createReview = async (reviewer_id: string, target_id: string, listing_id: string, rating: number, comment: string) => {
  const result = await pool.query(
    `INSERT INTO reviews (reviewer_id, target_id, listing_id, rating, comment) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [reviewer_id, target_id, listing_id, rating, comment]
  );
  return result.rows[0];
};

export const getReviewsForUser = async (target_id: string) => {
  const result = await pool.query(
    `SELECT r.*, u.name as reviewer_name 
     FROM reviews r 
     JOIN users u ON r.reviewer_id = u.id 
     WHERE r.target_id = $1 
     ORDER BY r.created_at DESC`,
    [target_id]
  );
  return result.rows;
};

export const getUserRating = async (target_id: string) => {
    const result = await pool.query(
        `SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews 
         FROM reviews 
         WHERE target_id = $1`,
        [target_id]
    );
    return result.rows[0];
};
