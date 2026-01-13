import { Router } from 'express';
import * as bankExpenseController from '../controllers/bank-expense.controller';
import * as invoiceController from '../controllers/invoice.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Bank Expense routes
router.get('/expenses', authenticate, bankExpenseController.getAll);
router.post('/expenses', authenticate, bankExpenseController.create);
router.get('/expenses/:id', authenticate, bankExpenseController.getById);
router.put('/expenses/:id', authenticate, bankExpenseController.update);
router.delete('/expenses/:id', authenticate, bankExpenseController.remove);
router.get('/object-cards/:objectCardId/expenses', authenticate, bankExpenseController.getByObjectCardId);

// Invoice routes
router.get('/invoices', authenticate, invoiceController.getAll);
router.post('/invoices', authenticate, invoiceController.create);
router.get('/invoices/:id', authenticate, invoiceController.getById);
router.put('/invoices/:id', authenticate, invoiceController.update);
router.delete('/invoices/:id', authenticate, invoiceController.remove);
router.get('/object-cards/:objectCardId/invoices', authenticate, invoiceController.getByObjectCardId);

export default router;
