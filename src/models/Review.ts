import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  patient: mongoose.Types.ObjectId;
  dentist: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  comment: string;
  isPublic: boolean;
  isVerified: boolean;
  helpful: number;
  reported: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  dentist: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Dentist is required']
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },
  appointment: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    enum: [1, 2, 3, 4, 5],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: 500
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0,
    min: 0
  },
  reported: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes
ReviewSchema.index({ patient: 1, service: 1 }, { unique: true });
ReviewSchema.index({ dentist: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ isPublic: 1, isVerified: 1 });
ReviewSchema.index({ createdAt: -1 });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
