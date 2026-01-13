import { Router } from 'express';
import * as projectOrganizationController from '../controllers/project-organization.controller';
import * as contractorController from '../controllers/contractor.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Project Organization routes
router.get('/project-organizations', authenticate, projectOrganizationController.getAll);
router.post('/project-organizations', authenticate, projectOrganizationController.create);
router.get('/project-organizations/:id', authenticate, projectOrganizationController.getById);
router.put('/project-organizations/:id', authenticate, projectOrganizationController.update);
router.delete('/project-organizations/:id', authenticate, projectOrganizationController.remove);

// Contractor routes
router.get('/contractors', authenticate, contractorController.getAll);
router.post('/contractors', authenticate, contractorController.create);
router.get('/contractors/:id', authenticate, contractorController.getById);
router.put('/contractors/:id', authenticate, contractorController.update);
router.delete('/contractors/:id', authenticate, contractorController.remove);

export default router;
