import { Router } from 'express';
import { signUp, signIn, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.get('/me', authenticate, getMe);

export default router;
