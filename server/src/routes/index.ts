import { Router } from 'express';
import authRoutes from './auth.routes';
import referenceRoutes from './reference.routes';
import statusItemsRoutes from './status-items.routes';
import organizationEntitiesRoutes from './organization-entities.routes';
import objectCardRoutes from './object-card.routes';
import objectRelatedRoutes from './object-related.routes';
import financialRoutes from './financial.routes';
import fileRoutes from './file.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Reference data routes (regions, districts, organizations)
router.use('/', referenceRoutes);

// Status and items routes (construction-statuses, construction-items)
router.use('/', statusItemsRoutes);

// Organization entities routes (project-organizations, contractors)
router.use('/', organizationEntitiesRoutes);

// Object card routes (main entity)
router.use('/', objectCardRoutes);

// Object related routes (contracts, estimates, sub-objects)
router.use('/', objectRelatedRoutes);

// Financial routes (expenses, invoices)
router.use('/', financialRoutes);

// File routes
router.use('/', fileRoutes);

// Dashboard routes
router.use('/dashboard', dashboardRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

export default router;
