import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['classroom', 'equipment', 'lab'], required: true },
  availability: { type: Boolean, default: true },
  reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reservationDate: { type: Date, default: Date.now },
  reservationExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;