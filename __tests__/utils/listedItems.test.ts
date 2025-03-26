import { ScheduledPickup } from '../../contexts/UserContext';

// Utility function to check if an item can be deleted (not in any active pickup)
const canDeleteItem = (itemId: string, pickups: ScheduledPickup[]): boolean => {
  // Check if the item is part of any ONGOING pickup (allow deletion for completed/cancelled)
  const isInActivePickup = pickups.some(pickup => 
    pickup.listedItemIds.includes(itemId) && pickup.status === 'ongoing'
  );
  
  // Item can be deleted if it's not in an active pickup
  return !isInActivePickup;
};

// Sample data for testing
const mockPickups: ScheduledPickup[] = [
  {
    id: 'pickup1',
    facilityName: 'Facility A',
    items: [
      { id: 'item1', name: 'Item 1' },
      { id: 'item2', name: 'Item 2' }
    ],
    listedItemIds: ['item1', 'item2'],
    status: 'ongoing',
    date: new Date().toISOString()
  },
  {
    id: 'pickup2',
    facilityName: 'Facility B',
    items: [
      { id: 'item3', name: 'Item 3' }
    ],
    listedItemIds: ['item3'],
    status: 'completed',
    date: new Date().toISOString()
  },
  {
    id: 'pickup3',
    facilityName: 'Facility C',
    items: [
      { id: 'item4', name: 'Item 4' }
    ],
    listedItemIds: ['item4'],
    status: 'cancelled',
    date: new Date().toISOString()
  }
];

describe('ListedItems Utilities', () => {
  describe('canDeleteItem', () => {
    it('should return false if item is in an ongoing pickup', () => {
      expect(canDeleteItem('item1', mockPickups)).toBe(false);
      expect(canDeleteItem('item2', mockPickups)).toBe(false);
    });
    
    it('should return true if item is in a completed pickup', () => {
      expect(canDeleteItem('item3', mockPickups)).toBe(true);
    });
    
    it('should return true if item is in a cancelled pickup', () => {
      expect(canDeleteItem('item4', mockPickups)).toBe(true);
    });
    
    it('should return true if item is not in any pickup', () => {
      expect(canDeleteItem('item5', mockPickups)).toBe(true);
    });
    
    it('should handle empty pickup array', () => {
      expect(canDeleteItem('item1', [])).toBe(true);
    });
  });
}); 