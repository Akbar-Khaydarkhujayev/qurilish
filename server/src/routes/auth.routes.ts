import { Router } from 'express';
import { signUp, signIn, getMe, createUser } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/sign-up', signUp);
router.post('/sign-in', signIn);

// Protected routes
router.get('/me', authenticate, getMe);

// Admin routes (super_admin and region_admin can create users)
router.post('/users', authenticate, authorize('super_admin', 'region_admin'), createUser);

export default router;
