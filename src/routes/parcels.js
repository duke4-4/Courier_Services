import express from 'express';
import { body } from 'express-validator';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createParcel,
  getParcels,
  getParcel,
  updateParcelStatus,
  trackParcel
} from '../controllers/parcelController.js';

const router = express.Router();

router.use(protect); // Protect all routes

router.post('/', restrictTo('operator'), validate([
  body('receiverName').notEmpty().withMessage('Receiver name is required'),
  body('receiverPhone').notEmpty().withMessage('Receiver phone is required'),
  body('destinationBranchId').notEmpty().withMessage('Destination branch is required'),
]), createParcel);

router.get('/', getParcels);
router.get('/:id', getParcel);
router.get('/track/:trackingNumber', trackParcel);

router.post('/:id/status', restrictTo('operator'), validate([
  body('status').isIn(['pending', 'in_transit', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
]), updateParcelStatus);

export default router; 