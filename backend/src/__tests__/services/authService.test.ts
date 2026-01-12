import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { registerUser, loginUser } from '../../services/authService';
import { User } from '../../models/User';
import { Provider } from '../../models/Provider';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Provider.deleteMany({});
});

describe('Auth Service', () => {
  describe('registerUser', () => {
    it('should register a new customer successfully', async () => {
      const result = await registerUser(
        'Test User',
        'test@example.com',
        'password123',
        '+919999999999',
        'customer'
      );

      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe('customer');
    });

    it('should register a provider and create provider profile', async () => {
      const result = await registerUser(
        'Test Provider',
        'provider@example.com',
        'password123',
        '+919999999999',
        'provider'
      );

      expect(result.user.role).toBe('provider');
      
      const provider = await Provider.findOne({ user: result.user._id });
      expect(provider).toBeDefined();
    });

    it('should throw error for duplicate email', async () => {
      await registerUser(
        'Test User',
        'test@example.com',
        'password123',
        '+919999999999'
      );

      await expect(
        registerUser(
          'Another User',
          'test@example.com',
          'password123',
          '+919999999998'
        )
      ).rejects.toThrow();
    });
  });

  describe('loginUser', () => {
    it('should login with correct credentials', async () => {
      await registerUser(
        'Test User',
        'test@example.com',
        'password123',
        '+919999999999'
      );

      const result = await loginUser('test@example.com', 'password123');

      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error for incorrect password', async () => {
      await registerUser(
        'Test User',
        'test@example.com',
        'password123',
        '+919999999999'
      );

      await expect(
        loginUser('test@example.com', 'wrongpassword')
      ).rejects.toThrow();
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        loginUser('nonexistent@example.com', 'password123')
      ).rejects.toThrow();
    });
  });
});

