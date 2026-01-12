import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  customer: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  service: string;
  status: 'pending' | 'accepted' | 'started' | 'completed' | 'cancelled' | 'disputed';
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  emergency: boolean;
  isLocked: boolean;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    service: {
      type: String,
      required: [true, 'Service is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'started', 'completed', 'cancelled', 'disputed'],
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
    actualDuration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
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
    emergency: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockedUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
BookingSchema.index({ location: '2dsphere' });
BookingSchema.index({ customer: 1 });
BookingSchema.index({ provider: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ emergency: 1, isLocked: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

