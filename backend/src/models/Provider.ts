import mongoose, { Schema, Document } from 'mongoose';

export interface IProvider extends Document {
  user: mongoose.Types.ObjectId;
  services: string[];
  experience: number; // years of experience
  hourlyRate: number;
  availability: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  isVerified: boolean;
  isAvailable: boolean;
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    updatedAt: Date;
  };
  rating: number;
  totalRatings: number;
  badges: string[];
  bio?: string;
  documents?: {
    idProof?: string;
    license?: string;
    certificate?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProviderSchema = new Schema<IProvider>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    services: [
      {
        type: String,
        required: true,
      },
    ],
    experience: {
      type: Number,
      required: [true, 'Experience is required'],
      min: [0, 'Experience cannot be negative'],
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: [0, 'Hourly rate cannot be negative'],
    },
    availability: {
      monday: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        available: { type: Boolean, default: true },
      },
      tuesday: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        available: { type: Boolean, default: true },
      },
      wednesday: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        available: { type: Boolean, default: true },
      },
      thursday: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        available: { type: Boolean, default: true },
      },
      friday: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        available: { type: Boolean, default: true },
      },
      saturday: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        available: { type: Boolean, default: true },
      },
      sunday: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        available: { type: Boolean, default: true },
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    badges: [
      {
        type: String,
        enum: ['verified', 'top-rated', 'fast-response', 'expert', 'popular'],
      },
    ],
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    documents: {
      idProof: String,
      license: String,
      certificate: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
ProviderSchema.index({ currentLocation: '2dsphere' });
ProviderSchema.index({ user: 1 });
ProviderSchema.index({ isVerified: 1, isAvailable: 1 });
ProviderSchema.index({ services: 1 });

export const Provider = mongoose.model<IProvider>('Provider', ProviderSchema);

