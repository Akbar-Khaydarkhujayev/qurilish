import { Router } from 'express';
import * as camerasController from '../controllers/cameras.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/object-cards/:objectCardId/cameras', authenticate, camerasController.getByObjectCardId);
router.post('/object-cards/:objectCardId/cameras', authenticate, camerasController.create);
router.put('/cameras/:id', authenticate, camerasController.update);
router.delete('/cameras/:id', authenticate, camerasController.remove);

export default router;
