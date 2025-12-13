import express from 'express';
import {
  getProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateProduct } from '../middleware/validation.js';

const router = express.Router();

// Routes publiques
router.get('/', getProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

// Routes admin
router.post('/', authenticate, authorize('admin', 'super_admin'), validateProduct, createProduct);
router.put('/:id', authenticate, authorize('admin', 'super_admin'), updateProduct);
router.delete('/:id', authenticate, authorize('admin', 'super_admin'), deleteProduct);

export default router;

