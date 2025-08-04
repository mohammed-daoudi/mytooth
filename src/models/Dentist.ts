import mongoose, { Document, Schema } from 'mongoose';

export interface IDentist extends Document {
  userId: mongoose.Types.ObjectId;
  specialization: string;
  bio?: string;
  licenseNumber: string;
  yearsOfExperience: number;
  education: string[];
  certifications: string[];
  availabilityConfig: {
    monday: { isAvailable: boolean; startTime: string; endTime: string; };
    tuesday: { isAvailable: boolean; startTime: string; endTime: string; };
    wednesday: { isAvailable: boolean; startTime: string; endTime: string; };
    thursday: { isAvailable: boolean; startTime: string; endTime: string; };
    friday: { isAvailable: boolean; startTime: string; endTime: string; };
    saturday: { isAvailable: boolean; startTime: string; endTime: string; };
    sunday: { isAvailable: boolean; startTime: string; endTime: string; };
  };
  consultationFee: number;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AvailabilityDaySchema = new Schema({
  isAvailable: { type: Boolean, default: true },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '17:00' }
}, { _id: false });

const DentistSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    enum: [
      'General Dentistry',
      'Orthodontics',
      'Oral Surgery',
      'Endodontics',
      'Periodontics',
      'Prosthodontics',
      'Pediatric Dentistry',
      'Cosmetic Dentistry',
      'Oral Pathology'
    ]
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true
  },
  yearsOfExperience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: 0,
    max: 50
  },
  education: [{
    type: String,
    maxlength: 200
  }],
  certifications: [{
    type: String,
    maxlength: 200
  }],
  availabilityConfig: {
    monday: { type: AvailabilityDaySchema, default: {} },
    tuesday: { type: AvailabilityDaySchema, default: {} },
    wednesday: { type: AvailabilityDaySchema, default: {} },
    thursday: { type: AvailabilityDaySchema, default: {} },
    friday: { type: AvailabilityDaySchema, default: {} },
    saturday: { type: AvailabilityDaySchema, default: { isAvailable: false } },
    sunday: { type: AvailabilityDaySchema, default: { isAvailable: false } }
  },
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
DentistSchema.index({ userId: 1 });
DentistSchema.index({ specialization: 1 });
DentistSchema.index({ isActive: 1 });
DentistSchema.index({ rating: -1 });
DentistSchema.index({ licenseNumber: 1 }, { unique: true });

// Soft delete support
DentistSchema.index({ deletedAt: 1 });

export default mongoose.models.Dentist || mongoose.model<IDentist>('Dentist', DentistSchema);
