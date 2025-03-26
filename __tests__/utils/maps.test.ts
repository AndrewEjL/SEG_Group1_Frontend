/**
 * Tests for map utility functions extracted from the GoogleMapsScreens components
 */

// Mock fetch for API calls
global.fetch = jest.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve({})
  })
) as jest.Mock;

// Utility functions extracted from the components for testing
const formatCoordinates = (lat: number, lng: number) => {
  return { latitude: lat, longitude: lng };
};

const isValidCoordinate = (latitude: number | null, longitude: number | null): boolean => {
  if (latitude === null || longitude === null) return false;
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
};

const extractMapRegion = (latitude: number, longitude: number, delta = 0.01) => {
  return {
    latitude,
    longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}`;
};

const formatDistance = (meters: number): string => {
  const kilometers = (meters / 1000).toFixed(2);
  return `${kilometers} km`;
};

describe('Map Utility Functions', () => {
  describe('formatCoordinates', () => {
    test('should format latitude and longitude as an object', () => {
      const result = formatCoordinates(1.4808, 103.7644);
      expect(result).toEqual({ latitude: 1.4808, longitude: 103.7644 });
    });
  });

  describe('isValidCoordinate', () => {
    test('should return true for valid coordinates', () => {
      expect(isValidCoordinate(0, 0)).toBe(true);
      expect(isValidCoordinate(90, 180)).toBe(true);
      expect(isValidCoordinate(-90, -180)).toBe(true);
      expect(isValidCoordinate(45.5, -122.6)).toBe(true);
    });

    test('should return false for invalid coordinates', () => {
      expect(isValidCoordinate(null, 0)).toBe(false);
      expect(isValidCoordinate(0, null)).toBe(false);
      expect(isValidCoordinate(null, null)).toBe(false);
      expect(isValidCoordinate(91, 0)).toBe(false);
      expect(isValidCoordinate(0, 181)).toBe(false);
      expect(isValidCoordinate(-91, 0)).toBe(false);
      expect(isValidCoordinate(0, -181)).toBe(false);
    });
  });

  describe('extractMapRegion', () => {
    test('should create a map region with default delta', () => {
      const result = extractMapRegion(1.4808, 103.7644);
      expect(result).toEqual({
        latitude: 1.4808,
        longitude: 103.7644,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    });

    test('should create a map region with custom delta', () => {
      const result = extractMapRegion(1.4808, 103.7644, 0.05);
      expect(result).toEqual({
        latitude: 1.4808,
        longitude: 103.7644,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    });
  });

  describe('formatDuration', () => {
    test('should format seconds into minutes', () => {
      expect(formatDuration(60)).toBe('1 min');
      expect(formatDuration(120)).toBe('2 mins');
      expect(formatDuration(900)).toBe('15 mins');
    });

    test('should format seconds into hours and minutes', () => {
      expect(formatDuration(3600)).toBe('1 hour');
      expect(formatDuration(7200)).toBe('2 hours');
      expect(formatDuration(5400)).toBe('1 hour 30 mins');
      expect(formatDuration(9000)).toBe('2 hours 30 mins');
    });
  });

  describe('formatDistance', () => {
    test('should format meters into kilometers', () => {
      expect(formatDistance(1000)).toBe('1.00 km');
      expect(formatDistance(1500)).toBe('1.50 km');
      expect(formatDistance(10500)).toBe('10.50 km');
    });
  });
}); 