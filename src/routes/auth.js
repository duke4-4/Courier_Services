import express from 'express';
import { body } from 'express-validator';
import { login, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/login', validate([
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
]), login);

router.get('/me', protect, getCurrentUser);

export default router;