import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  description: string;
  category: 'general' | 'cosmetic' | 'orthodontics' | 'surgery' | 'pediatric' | 'emergency';
  duration: number; // in minutes
  price: number;
  image?: string;
  isActive: boolean;
  requirements?: string[];
  afterCareInstructions?: string;
  painLevel: 1 | 2 | 3 | 4 | 5; // 1 = minimal, 5 = significant
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: 100,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: 500
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: ['general', 'cosmetic', 'orthodontics', 'surgery', 'pediatric', 'emergency']
  },
  duration: {
    type: Number,
    required: [true, 'Service duration is required'],
    min: 15,
    max: 240
  },
  price: {
    type: Number,
    required: [true, 'Service price is required'],
    min: 0
  },
  image: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requirements: [{
    type: String,
    maxlength: 100
  }],
  afterCareInstructions: {
    type: String,
    maxlength: 1000
  },
  painLevel: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 1
  }
}, {
  timestamps: true
});

// Indexes
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ isActive: 1 });
ServiceSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
