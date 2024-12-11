const mongoose = require('mongoose');

const statusUpdateSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_transit', 'delivered', 'cancelled'],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  branchId: String,
  branchName: String,
  note: String,
});

const parcelSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  senderEmail: String,
  senderBranchId: {
    type: String,
    required: true,
  },
  dispatchBranch: String,
  dispatchAddress: String,
  receiverName: {
    type: String,
    required: true,
  },
  receiverEmail: String,
  receiverPhone: String,
  destinationBranch: String,
  destinationBranchId: {
    type: String,
    required: true,
  },
  description: String,
  weight: Number,
  vehicleType: String,
  paymentMethod: {
    type: String,
    enum: ['prepaid', 'postpaid'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending',
  },
  amount: Number,
  floatAmount: {
    type: Number,
    default: 0,
  },
  totalAmount: Number,
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: Date,
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  statusUpdates: [statusUpdateSchema],
}, {
  timestamps: true,
});

// Generate tracking number before saving
parcelSchema.pre('save', async function(next) {
  if (!this.trackingNumber) {
    const count = await this.constructor.countDocuments();
    this.trackingNumber = `PCL${String(count + 1001).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Parcel', parcelSchema); 