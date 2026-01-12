import { calculateDistance, addDistanceToProvider } from '../../utils/haversine';

describe('Haversine Distance Calculation', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // Bangalore to Mumbai (approximately 845 km)
      const distance = calculateDistance(12.9716, 77.5946, 19.0760, 72.8777);
      
      // Allow 50km tolerance
      expect(distance).toBeGreaterThan(795);
      expect(distance).toBeLessThan(895);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(12.9716, 77.5946, 12.9716, 77.5946);
      expect(distance).toBeCloseTo(0, 1);
    });

    it('should handle negative coordinates', () => {
      const distance = calculateDistance(-12.9716, -77.5946, -19.0760, -72.8777);
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('addDistanceToProvider', () => {
    it('should add distance to provider object', () => {
      const provider = {
        _id: '123',
        name: 'Test Provider',
        location: {
          coordinates: [77.5946, 12.9716], // [longitude, latitude]
        },
      };

      const result = addDistanceToProvider(provider, 12.9716, 77.5946);
      
      expect(result).toHaveProperty('distance');
      expect(result.distance).toBeCloseTo(0, 1);
    });

    it('should handle provider without location', () => {
      const provider = {
        _id: '123',
        name: 'Test Provider',
      };

      const result = addDistanceToProvider(provider, 12.9716, 77.5946);
      
      expect(result).toHaveProperty('distance');
      expect(result.distance).toBeNull();
    });
  });
});

