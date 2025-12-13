import express from 'express';
import {
  createQuote,
  getQuotes,
  getQuoteById,
  updateQuoteStatus,
} from '../controllers/quoteController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateQuote } from '../middleware/validation.js';

const router = express.Router();

// Route publique
router.post('/', validateQuote, createQuote);

// Routes admin
router.get('/', authenticate, authorize('admin', 'super_admin'), getQuotes);
router.get('/:id', authenticate, authorize('admin', 'super_admin'), getQuoteById);
router.put('/:id/status', authenticate, authorize('admin', 'super_admin'), updateQuoteStatus);

export default router;

