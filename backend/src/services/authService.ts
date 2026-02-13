import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { Provider } from '../models/Provider';
import { config } from '../config/env';
import { UnauthorizedError, ValidationError, ConflictError } from '../utils/errors';

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  phone: string,
  role: 'customer' | 'provider' | 'admin' = 'customer',
  location?: { coordinates: [number, number] }
): Promise<{ user: IUser; token: string }> => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const userData: any = {
    name,
    email,
    password: hashedPassword,
    phone,
    role,
  };

  if (location) {
    userData.location = {
      type: 'Point',
      coordinates: location.coordinates,
    };
  }

  const user = await User.create(userData);

  // If provider, create provider profile
  if (role === 'provider') {
    await Provider.create({
      user: user._id,
      services: [],
      experience: 0,
      hourlyRate: 0,
      isVerified: false,
      isAvailable: true,
    });
  }

  // Generate token
  const token = jwt.sign({ userId: user._id }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });

  const userWithoutPassword = await User.findById(user._id).select('-password');
  return { user: userWithoutPassword!, token };
};

export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: IUser; token: string }> => {
  // Find user with password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate token
  const token = jwt.sign({ userId: user._id }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });

  const userWithoutPassword = await User.findById(user._id).select('-password');
  return { user: userWithoutPassword!, token };
};

export const updateUserProfile = async (
  userId: string,
  updates: {
    role?: 'customer' | 'provider' | 'admin';
    name?: string;
    phone?: string;
  }
): Promise<IUser> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ValidationError('User not found');
  }

  // Prevent admin role changes
  if (updates.role && user.role === 'admin' && updates.role !== 'admin') {
    throw new ValidationError('Cannot change admin role');
  }

  // If changing to provider, ensure provider profile exists
  if (updates.role === 'provider' && user.role !== 'provider') {
    const existingProvider = await Provider.findOne({ user: user._id });
    if (!existingProvider) {
      await Provider.create({
        user: user._id,
        services: [],
        experience: 0,
        hourlyRate: 0,
        isVerified: false,
        isAvailable: true,
      });
    }
  }

  // If changing from provider to customer, we can keep the provider profile
  // (it won't be used if role is customer)

  // Update user fields
  if (updates.role !== undefined) user.role = updates.role;
  if (updates.name !== undefined) user.name = updates.name;
  if (updates.phone !== undefined) user.phone = updates.phone;

  await user.save();

  const userWithoutPassword = await User.findById(user._id).select('-password');
  return userWithoutPassword!;
};