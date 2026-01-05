import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import categoryRoutes from './modules/categories/category.routes';
import listingRoutes from './modules/listings/listing.routes';
import adminRoutes from './modules/admin/admin.routes';
import messageRoutes from './modules/messages/message.routes';
import aiRoutes from './modules/ai/ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/listings', listingRoutes);
router.use('/admin', adminRoutes);
router.use('/messages', messageRoutes);
router.use('/ai', aiRoutes);

export default router;
