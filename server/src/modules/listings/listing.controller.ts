import { Request, Response } from 'express';
import * as listingService from './listing.service';

// Extend Request to include user property (from auth middleware)
interface AuthRequest extends Request {
    user?: any;
}

export const createListing = async (req: AuthRequest, res: Response) => {
  try {
    const seller_id = req.user.id; // From middleware
    const listing = await listingService.createListing({ ...req.body, seller_id });
    res.status(201).json(listing);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getListings = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const listings = await listingService.getListings(filters);
    res.json(listings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getListingById = async (req: Request, res: Response) => {
    try {
        const listing = await listingService.getListingById(req.params.id);
        if (!listing) return res.status(404).json({ message: 'Listing not found' });
        res.json(listing);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
export const deleteListing = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const listingId = req.params.id;
        
        await listingService.deleteListing(listingId, userId, role);
        res.json({ message: 'Listing deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }

};

export const updateStatus = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const listingId = req.params.id;
        const { status } = req.body;
        
        const updated = await listingService.updateListingStatus(listingId, userId, status);
        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
