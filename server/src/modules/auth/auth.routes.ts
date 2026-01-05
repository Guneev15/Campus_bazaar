import { Router } from 'express';
import * as authController from './auth.controller';

const router = Router();

router.post('/signup', authController.signup);
router.post('/verify', authController.verify as any);
router.post('/login', authController.login);

export default router;
