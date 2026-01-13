import { Router } from 'express';
import * as constructionStatusController from '../controllers/construction-status.controller';
import * as constructionItemsController from '../controllers/construction-items.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Construction Status routes
router.get('/construction-statuses', authenticate, constructionStatusController.getAll);
router.post('/construction-statuses', authenticate, constructionStatusController.create);
router.get('/construction-statuses/:id', authenticate, constructionStatusController.getById);
router.put('/construction-statuses/:id', authenticate, constructionStatusController.update);
router.delete('/construction-statuses/:id', authenticate, constructionStatusController.remove);

// Construction Items routes
router.get('/construction-items', authenticate, constructionItemsController.getAll);
router.post('/construction-items', authenticate, constructionItemsController.create);
router.get('/construction-items/:id', authenticate, constructionItemsController.getById);
router.put('/construction-items/:id', authenticate, constructionItemsController.update);
router.delete('/construction-items/:id', authenticate, constructionItemsController.remove);

export default router;
