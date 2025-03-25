import { ScheduledPickup, RewardRedemption } from '../../contexts/UserContext';

// Utility function to format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Utility function to sort items by date (newest first)
const sortByDate = <T extends { date: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

// Sample data for testing
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const lastWeek = new Date(today);
lastWeek.setDate(lastWeek.getDate() - 7);
const lastMonth = new Date(today);
lastMonth.setMonth(lastMonth.getMonth() - 1);

const mockPickups: ScheduledPickup[] = [
  {
    id: 'pickup1',
    facilityName: 'Facility A',
    items: [{ id: 'item1', name: 'Item 1' }],
    listedItemIds: ['item1'],
    status: 'ongoing',
    date: lastWeek.toISOString()
  },
  {
    id: 'pickup2',
    facilityName: 'Facility B',
    items: [{ id: 'item2', name: 'Item 2' }],
    listedItemIds: ['item2'],
    status: 'completed',
    date: yesterday.toISOString()
  },
  {
    id: 'pickup3',
    facilityName: 'Facility C',
    items: [{ id: 'item3', name: 'Item 3' }],
    listedItemIds: ['item3'],
    status: 'cancelled',
    date: today.toISOString()
  },
  {
    id: 'pickup4',
    facilityName: 'Facility D',
    items: [{ id: 'item4', name: 'Item 4' }],
    listedItemIds: ['item4'],
    status: 'completed',
    date: lastMonth.toISOString()
  }
];

const mockRewards: RewardRedemption[] = [
  {
    id: 'reward1',
    name: 'Reward 1',
    value: 'RM15',
    pin: '1234567890',
    date: lastWeek.toISOString(),
    imageSource: null
  },
  {
    id: 'reward2',
    name: 'Reward 2',
    value: 'RM5',
    pin: '0987654321',
    date: today.toISOString(),
    imageSource: null
  },
  {
    id: 'reward3',
    name: 'Reward 3',
    value: 'RM30',
    pin: '1122334455',
    date: lastMonth.toISOString(),
    imageSource: null
  }
];

describe('Date Utilities', () => {
  describe('formatDate', () => {
    it('should format ISO date string to localized date string', () => {
      const date = new Date('2023-04-15T12:00:00Z');
      const formatted = formatDate(date.toISOString());
      
      // Check that the formatted date contains the expected components
      expect(formatted).toContain('Apr');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2023');
    });
    
    it('should handle different date formats consistently', () => {
      const date1 = formatDate(new Date('2023-01-01').toISOString());
      const date2 = formatDate('2023-01-01T00:00:00.000Z');
      
      expect(date1).toBe(date2);
    });
  });
  
  describe('sortByDate', () => {
    it('should sort pickups by date with newest first', () => {
      const sorted = sortByDate(mockPickups);
      
      // Check that dates are in descending order
      for (let i = 0; i < sorted.length - 1; i++) {
        const currentDate = new Date(sorted[i].date).getTime();
        const nextDate = new Date(sorted[i + 1].date).getTime();
        expect(currentDate).toBeGreaterThanOrEqual(nextDate);
      }
      
      // The first item should be today's pickup
      expect(sorted[0].id).toBe('pickup3');
      
      // The last item should be the oldest pickup
      expect(sorted[sorted.length - 1].id).toBe('pickup4');
    });
    
    it('should sort rewards by date with newest first', () => {
      const sorted = sortByDate(mockRewards);
      
      // Check that dates are in descending order
      for (let i = 0; i < sorted.length - 1; i++) {
        const currentDate = new Date(sorted[i].date).getTime();
        const nextDate = new Date(sorted[i + 1].date).getTime();
        expect(currentDate).toBeGreaterThanOrEqual(nextDate);
      }
      
      // The first item should be today's reward
      expect(sorted[0].id).toBe('reward2');
      
      // The last item should be the oldest reward
      expect(sorted[sorted.length - 1].id).toBe('reward3');
    });
    
    it('should return a new array without modifying the original', () => {
      const originalPickups = [...mockPickups];
      const sorted = sortByDate(mockPickups);
      
      // Check the original wasn't modified
      expect(mockPickups).toEqual(originalPickups);
      
      // Check the result is a different array instance
      expect(sorted).not.toBe(mockPickups);
    });
    
    it('should handle empty arrays', () => {
      const sorted = sortByDate<ScheduledPickup>([]);
      expect(sorted).toEqual([]);
    });
  });
}); 