import { Router } from 'express';
import pool from '../../config/db';
import { authenticate } from '../../middleware/auth.middleware';
import { isAdmin } from '../../middleware/admin.middleware';

const router = Router();

// Get all users
router.get('/users', authenticate, isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, role, is_verified, college_id FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Verify user
router.post('/users/:id/verify', authenticate, isAdmin, async (req, res) => {
    try {
        await pool.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [req.params.id]);
        res.json({ message: 'User verified' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get pending notes
router.get('/notes/pending', authenticate, isAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT nm.*, l.title, u.email as seller_email 
            FROM notes_metadata nm
            JOIN listings l ON nm.listing_id = l.id
            JOIN users u ON l.seller_id = u.id
            WHERE nm.is_approved = FALSE
        `);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Approve note
router.post('/notes/:id/approve', authenticate, isAdmin, async (req, res) => {
    try {
         await pool.query('UPDATE notes_metadata SET is_approved = TRUE WHERE id = $1', [req.params.id]);
         res.json({ message: 'Note approved' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
