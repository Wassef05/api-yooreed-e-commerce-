import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateCategory } from '../middleware/validation.js';

const router = express.Router();

// Routes publiques
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Routes admin
router.post('/', authenticate, authorize('admin', 'super_admin'), validateCategory, createCategory);
router.put('/:id', authenticate, authorize('admin', 'super_admin'), updateCategory);
router.delete('/:id', authenticate, authorize('admin', 'super_admin'), deleteCategory);

export default router;

