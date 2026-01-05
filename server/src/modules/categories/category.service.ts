import pool from '../../config/db';

export const getAllCategories = async () => {
  const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return result.rows;
};

export const createCategory = async (name: string, type: 'PHYSICAL' | 'DIGITAL') => {
  const result = await pool.query(
    'INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING *',
    [name, type]
  );
  return result.rows[0];
};
