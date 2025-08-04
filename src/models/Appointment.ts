import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  userId: mongoose.Types.ObjectId;
  dentistId: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  startsAt: Date;
  endsAt?: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string;
  dentistNotes?: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  price?: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  reminderSent: boolean;
  createdBy: 'USER' | 'ADMIN' | 'DENTIST';
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  dentistId: {
    type: Schema.Types.ObjectId,
    ref: 'Dentist',
    required: [true, 'Dentist is required']
  },
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service'
  },
  startsAt: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endsAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
    default: 'PENDING'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  dentistNotes: {
    type: String,
    maxlength: 500
  },
  symptoms: {
    type: String,
    maxlength: 300
  },
  diagnosis: {
    type: String,
    maxlength: 300
  },
  treatment: {
    type: String,
    maxlength: 300
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  price: {
    type: Number,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    enum: ['USER', 'ADMIN', 'DENTIST'],
    default: 'USER'
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
AppointmentSchema.index({ userId: 1, startsAt: 1 });
AppointmentSchema.index({ dentistId: 1, startsAt: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ startsAt: 1 });

// Compound index to prevent double booking
AppointmentSchema.index({
  dentistId: 1,
  startsAt: 1
}, {
  unique: true,
  partialFilterExpression: {
    status: { $in: ['PENDING', 'CONFIRMED'] }
  }
});

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
