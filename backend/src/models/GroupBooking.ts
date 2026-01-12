import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupBooking extends Document {
  customer: mongoose.Types.ObjectId;
  providers: mongoose.Types.ObjectId[];
  service: string;
  status: 'pending' | 'accepted' | 'started' | 'completed' | 'cancelled';
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration: number; // in minutes
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupBookingSchema = new Schema<IGroupBooking>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Provider',
        required: true,
      },
    ],
    service: {
      type: String,
      required: [true, 'Service is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'started', 'completed', 'cancelled'],
      default: 'pending',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: {
        type: String,
        required: [true, 'Address is required'],
      },
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled time is required'],
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    estimatedDuration: {
      type: Number,
      required: [true, 'Estimated duration is required'],
      min: [15, 'Minimum duration is 15 minutes'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

GroupBookingSchema.index({ location: '2dsphere' });
GroupBookingSchema.index({ customer: 1 });
GroupBookingSchema.index({ providers: 1 });
GroupBookingSchema.index({ status: 1 });
GroupBookingSchema.index({ scheduledAt: 1 });

export const GroupBooking = mongoose.model<IGroupBooking>('GroupBooking', GroupBookingSchema);

