import { Router } from 'express';
import * as regionsController from '../controllers/regions.controller';
import * as districtsController from '../controllers/districts.controller';
import * as organizationsController from '../controllers/organizations.controller';
import * as usersController from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Regions routes
router.get('/regions', authenticate, regionsController.getAll);
router.post('/regions', authenticate, regionsController.create);
router.get('/regions/:id', authenticate, regionsController.getById);
router.put('/regions/:id', authenticate, regionsController.update);
router.delete('/regions/:id', authenticate, regionsController.remove);

// Districts routes
router.get('/districts', authenticate, districtsController.getAll);
router.post('/districts', authenticate, districtsController.create);
router.get('/districts/:id', authenticate, districtsController.getById);
router.get('/districts/region/:regionId', authenticate, districtsController.getByRegionId);
router.put('/districts/:id', authenticate, districtsController.update);
router.delete('/districts/:id', authenticate, districtsController.remove);

// Organizations routes
router.get('/organizations', authenticate, organizationsController.getAll);
router.post('/organizations', authenticate, organizationsController.create);
router.get('/organizations/:id', authenticate, organizationsController.getById);
router.put('/organizations/:id', authenticate, organizationsController.update);
router.delete('/organizations/:id', authenticate, organizationsController.remove);

// Users routes
router.get('/users', authenticate, usersController.getAll);
router.post('/users', authenticate, usersController.create);
router.get('/users/:id', authenticate, usersController.getById);
router.put('/users/:id', authenticate, usersController.update);
router.delete('/users/:id', authenticate, usersController.remove);

export default router;
