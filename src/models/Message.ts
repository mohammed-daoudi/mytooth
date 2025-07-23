import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'appointment' | 'system';
  attachments: string[];
  isRead: boolean;
  readAt?: Date;
  attachment?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  };
  metadata?: {
    appointmentId?: mongoose.Types.ObjectId;
    systemMessageType?: 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_reminder';
  };
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'appointment', 'system'],
    default: 'text'
  },
  attachments: [{
    type: String
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  attachment: {
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  },
  metadata: {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    systemMessageType: {
      type: String,
      enum: ['appointment_confirmed', 'appointment_cancelled', 'appointment_reminder']
    }
  }
}, {
  timestamps: true
});

// Indexes
MessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, isRead: 1 });
MessageSchema.index({ createdAt: -1 });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
