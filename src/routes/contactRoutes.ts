import express from 'express';
import { sendContactMessage } from '../controllers/contactController.js';
import { validateContact } from '../middleware/validation.js';

const router = express.Router();

router.post('/', validateContact, sendContactMessage);

export default router;

