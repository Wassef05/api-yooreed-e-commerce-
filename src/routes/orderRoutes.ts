import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateOrder } from '../middleware/validation.js';

const router = express.Router();

// Route publique
router.post('/', validateOrder, createOrder);

// Routes admin
router.get('/', authenticate, authorize('admin', 'super_admin'), getOrders);
router.get('/:id', authenticate, authorize('admin', 'super_admin'), getOrderById);
router.put('/:id/status', authenticate, authorize('admin', 'super_admin'), updateOrderStatus);

export default router;

