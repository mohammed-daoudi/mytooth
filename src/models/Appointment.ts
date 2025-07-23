import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  dentist: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number; // in minutes
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  price?: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema({
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
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  duration: {
    type: Number,
    default: 60,
    min: 15,
    max: 240
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
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
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
AppointmentSchema.index({ patient: 1, appointmentDate: 1 });
AppointmentSchema.index({ dentist: 1, appointmentDate: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ appointmentDate: 1 });

// Compound index to prevent double booking
AppointmentSchema.index({
  dentist: 1,
  appointmentDate: 1,
  appointmentTime: 1
}, {
  unique: true,
  partialFilterExpression: {
    status: { $in: ['scheduled', 'confirmed'] }
  }
});

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
