import { Router } from 'express';
import * as listingController from './listing.controller';
import { authenticate } from '../../middleware/auth.middleware'; // To be created

const router = Router();

router.post('/', authenticate, listingController.createListing as any);
router.get('/', listingController.getListings);
router.get('/:id', listingController.getListingById as any);
router.delete('/:id', authenticate, listingController.deleteListing as any);

export default router;
