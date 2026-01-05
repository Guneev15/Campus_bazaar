import { Router } from 'express';
import * as categoryController from './category.controller';

const router = Router();

router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory); // Add auth middleware later for admin only

export default router;
