import { Router } from 'express';
import * as objectContractController from '../controllers/object-contract.controller';
import * as objectEstimateController from '../controllers/object-estimate.controller';
import * as subObjectCardController from '../controllers/sub-object-card.controller';
import * as subObjectCardItemController from '../controllers/sub-object-card-item.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Object Contract routes
router.get('/contracts', authenticate, objectContractController.getAll);
router.post('/contracts', authenticate, objectContractController.create);
router.get('/contracts/:id', authenticate, objectContractController.getById);
router.put('/contracts/:id', authenticate, objectContractController.update);
router.delete('/contracts/:id', authenticate, objectContractController.remove);
router.get('/object-cards/:objectCardId/contracts', authenticate, objectContractController.getByObjectCardId);

// Object Estimate routes
router.get('/estimates', authenticate, objectEstimateController.getAll);
router.post('/estimates', authenticate, objectEstimateController.create);
router.get('/estimates/:id', authenticate, objectEstimateController.getById);
router.put('/estimates/:id', authenticate, objectEstimateController.update);
router.delete('/estimates/:id', authenticate, objectEstimateController.remove);
router.get('/object-cards/:objectCardId/estimates', authenticate, objectEstimateController.getByObjectCardId);

// Sub-Object Card routes
router.get('/sub-objects', authenticate, subObjectCardController.getAll);
router.post('/sub-objects', authenticate, subObjectCardController.create);
router.get('/sub-objects/:id', authenticate, subObjectCardController.getById);
router.put('/sub-objects/:id', authenticate, subObjectCardController.update);
router.delete('/sub-objects/:id', authenticate, subObjectCardController.remove);
router.get('/object-cards/:objectCardId/sub-objects', authenticate, subObjectCardController.getByObjectCardId);

// Sub-Object Card Item routes
router.get('/sub-object-items', authenticate, subObjectCardItemController.getAll);
router.post('/sub-object-items', authenticate, subObjectCardItemController.create);
router.get('/sub-object-items/:id', authenticate, subObjectCardItemController.getById);
router.put('/sub-object-items/:id', authenticate, subObjectCardItemController.update);
router.delete('/sub-object-items/:id', authenticate, subObjectCardItemController.remove);
router.get('/sub-objects/:subObjectCardId/items', authenticate, subObjectCardItemController.getBySubObjectCardId);

export default router;
