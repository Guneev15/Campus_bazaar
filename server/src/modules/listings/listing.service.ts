import pool from '../../config/db';

export const createListing = async (listingData: any) => {
  const { seller_id, title, description, price, type, category_id, attributes, notes_url, image_url, condition, tags } = listingData;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Create Listing
    const listingQuery = `
      INSERT INTO listings (seller_id, title, description, price, type, category_id, attributes, image_url, condition, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`;
    const listingValues = [seller_id, title, description, price, type, category_id, attributes, image_url, condition || 'USED', tags || []];
    const listingResult = await client.query(listingQuery, listingValues);
    const listing = listingResult.rows[0];

    // 2. If Digital, create Note Metadata
    if (type === 'DIGITAL') {
       // Ideally validation ensuring notes_url exists
       const noteQuery = `
         INSERT INTO notes_metadata (listing_id, file_url, is_approved)
         VALUES ($1, $2, $3)
       `;
       await client.query(noteQuery, [listing.id, notes_url || '', false]);
    }

    await client.query('COMMIT');
    return listing;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getListings = async (filters: any) => {
  let query = 'SELECT * FROM listings WHERE status = \'ACTIVE\'';
  const values: any[] = [];
  
  if (filters.category_id) {
    values.push(filters.category_id);
    query += ` AND category_id = $${values.length}`;
  }

  if (filters.condition) {
    values.push(filters.condition);
    query += ` AND condition = $${values.length}`;
  }

  if (filters.min_price) {
    values.push(filters.min_price);
    query += ` AND price >= $${values.length}`;
  }

  if (filters.max_price) {
    values.push(filters.max_price);
    query += ` AND price <= $${values.length}`;
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, values);
  return result.rows;
};

export const getListingById = async (id: string) => {
  const result = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);
  return result.rows[0];
};

export const deleteListing = async (listingId: string, userId: string, role: string) => {
    const client = await pool.connect();
    try {
        // Check ownership
        const listingCheck = await client.query('SELECT seller_id FROM listings WHERE id = $1', [listingId]);
        
        if (listingCheck.rows.length === 0) {
            throw new Error('Listing not found');
        }

        const listing = listingCheck.rows[0];

        if (listing.seller_id !== userId && role !== 'ADMIN') {
            throw new Error('Unauthorized to delete this listing');
        }

        // Manual cascading delete
        await client.query('BEGIN');
        
        // 1. Delete related messages
        await client.query('DELETE FROM messages WHERE listing_id = $1', [listingId]);

        // 2. Delete note metadata if it exists
        await client.query('DELETE FROM notes_metadata WHERE listing_id = $1', [listingId]);

        // 3. Delete the listing
        await client.query('DELETE FROM listings WHERE id = $1', [listingId]);
        
        await client.query('COMMIT');
        
        return { message: 'Listing deleted successfully' };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
    }
};

export const updateListingStatus = async (id: string, seller_id: string, status: 'ACTIVE' | 'SOLD') => {
  const result = await pool.query(
    `UPDATE listings 
     SET status = $1 
     WHERE id = $2 AND seller_id = $3 
     RETURNING *`,
    [status, id, seller_id]
  );
  
  if (result.rows.length === 0) {
      throw new Error('Listing not found or unauthorized');
  }
  
  return result.rows[0];
};
