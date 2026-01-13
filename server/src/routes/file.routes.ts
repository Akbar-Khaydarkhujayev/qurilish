import { Router } from 'express';
import * as fileController from '../controllers/file.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// File routes
router.get('/files', authenticate, fileController.getAll);
router.post('/files', authenticate, fileController.create);
router.get('/files/:id', authenticate, fileController.getById);
router.put('/files/:id', authenticate, fileController.update);
router.delete('/files/:id', authenticate, fileController.remove);
router.get('/object-cards/:objectCardId/files', authenticate, fileController.getByObjectCardId);

export default router;
