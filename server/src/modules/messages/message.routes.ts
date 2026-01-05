import { Router } from 'express';
import * as messageController from './message.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, messageController.sendMessage as any);
router.get('/', authenticate, messageController.getConversations as any);
router.get('/thread', authenticate, messageController.getThread as any);

export default router;
