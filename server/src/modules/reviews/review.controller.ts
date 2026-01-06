import { Request, Response } from 'express';
import * as reviewService from './review.service';

export const createReview = async (req: Request, res: Response) => {
  try {
    // Authenticated user is the reviewer
    const reviewer_id = (req as any).user.id; 
    const { target_id, listing_id, rating, comment } = req.body;

    if (!target_id || !listing_id || !rating) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (reviewer_id === target_id) {
        return res.status(400).json({ error: 'Cannot review yourself' });
    }

    const review = await reviewService.createReview(reviewer_id, target_id, listing_id, rating, comment);
    res.status(201).json(review);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserReviews = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const reviews = await reviewService.getReviewsForUser(userId);
        const stats = await reviewService.getUserRating(userId);
        
        res.json({ reviews, stats });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
