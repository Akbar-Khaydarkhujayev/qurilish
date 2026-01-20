import { Router } from 'express';
import { getStatistics } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/statistics', authenticate, getStatistics);

export default router;
