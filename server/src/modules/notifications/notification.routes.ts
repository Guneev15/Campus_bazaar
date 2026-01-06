import { Router } from 'express';
import * as notificationController from './notification.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/notifications - Get all my notifications
router.get('/', authenticate, notificationController.getMyNotifications);

// PUT /api/notifications/:id/read - Mark one as read
router.put('/:id/read', authenticate, notificationController.markRead);

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', authenticate, notificationController.markAllRead);

export default router;
