import { Router } from 'express';
import * as objectCardController from '../controllers/object-card.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Object Card routes
router.get('/object-cards', authenticate, objectCardController.getAll);
router.post('/object-cards', authenticate, objectCardController.create);
router.get('/object-cards/:id', authenticate, objectCardController.getById);
router.get('/object-cards/:id/summary', authenticate, objectCardController.getSummary);
router.put('/object-cards/:id', authenticate, objectCardController.update);
router.delete('/object-cards/:id', authenticate, objectCardController.remove);

export default router;
