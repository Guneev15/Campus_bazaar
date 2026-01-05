import { Router } from 'express';
import multer from 'multer';
import * as aiController from './ai.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post(
  '/generate', 
  authenticate, 
  upload.single('image'), 
  aiController.generateListing
);

export default router;
