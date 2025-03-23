import {
  isItemInPickup,
  filterPickupsByStatus,
  getStatusColor,
  sortItemsByPickupStatus
} from '../../utils/pickups';
import { ListedItem, ScheduledPickup } from '../../contexts/UserContext';

// Mock data for testing
const mockPickups: ScheduledPickup[] = [
  {
    id: 'pickup1',
    facilityName: 'Facility A',
    items: [{ id: 'item1', name: 'Item 1' }, { id: 'item2', name: 'Item 2' }],
    listedItemIds: ['item1', 'item2'],
    status: 'ongoing'
  },
  {
    id: 'pickup2',
    facilityName: 'Facility B',
    items: [{ id: 'item3', name: 'Item 3' }],
    listedItemIds: ['item3'],
    status: 'completed'
  },
  {
    id: 'pickup3',
    facilityName: 'Facility C',
    items: [{ id: 'item4', name: 'Item 4' }],
    listedItemIds: ['item4'],
    status: 'cancelled'
  }
];

const mockItems: ListedItem[] = [
  {
    id: 'item1',
    userId: 'user1',
    name: 'Item 1',
    type: 'Type A',
    condition: 'Working',
    dimensions: { length: '10', width: '10', height: '10' },
    quantity: '1',
    createdAt: new Date(),
    address: 'Address 1'
  },
  {
    id: 'item2',
    userId: 'user1',
    name: 'Item 2',
    type: 'Type B',
    condition: 'Working',
    dimensions: { length: '20', width: '20', height: '20' },
    quantity: '2',
    createdAt: new Date(),
    address: 'Address 2'
  },
  {
    id: 'item5',
    userId: 'user1',
    name: 'Item 5',
    type: 'Type C',
    condition: 'Not Working',
    dimensions: { length: '30', width: '30', height: '30' },
    quantity: '3',
    createdAt: new Date(),
    address: 'Address 3'
  }
];

describe('isItemInPickup', () => {
  test('should return true if item is in a pickup', () => {
    expect(isItemInPickup('item1', mockPickups)).toBe(true);
    expect(isItemInPickup('item2', mockPickups)).toBe(true);
    expect(isItemInPickup('item3', mockPickups)).toBe(true);
    expect(isItemInPickup('item4', mockPickups)).toBe(true);
  });

  test('should return false if item is not in a pickup', () => {
    expect(isItemInPickup('item5', mockPickups)).toBe(false);
    expect(isItemInPickup('item6', mockPickups)).toBe(false);
    expect(isItemInPickup('', mockPickups)).toBe(false);
  });

  test('should handle empty pickups array', () => {
    expect(isItemInPickup('item1', [])).toBe(false);
  });
});

describe('filterPickupsByStatus', () => {
  test('should filter pickups by ongoing status', () => {
    const filtered = filterPickupsByStatus(mockPickups, 'ongoing');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('pickup1');
  });

  test('should filter pickups by completed status', () => {
    const filtered = filterPickupsByStatus(mockPickups, 'completed');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('pickup2');
  });

  test('should filter pickups by cancelled status', () => {
    const filtered = filterPickupsByStatus(mockPickups, 'cancelled');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('pickup3');
  });

  test('should return all pickups when status is "all"', () => {
    const filtered = filterPickupsByStatus(mockPickups, 'all');
    expect(filtered.length).toBe(3);
  });

  test('should handle empty array', () => {
    expect(filterPickupsByStatus([], 'ongoing').length).toBe(0);
    expect(filterPickupsByStatus([], 'all').length).toBe(0);
  });
});

describe('getStatusColor', () => {
  test('should return correct color for completed status', () => {
    expect(getStatusColor('completed')).toBe('#4CAF50'); // Green
  });

  test('should return correct color for cancelled status', () => {
    expect(getStatusColor('cancelled')).toBe('#F44336'); // Red
  });

  test('should return correct color for ongoing status', () => {
    expect(getStatusColor('ongoing')).toBe('#FFC107'); // Yellow
  });

  test('should return default color for unknown status', () => {
    expect(getStatusColor('unknown')).toBe('#757575'); // Grey
    expect(getStatusColor('')).toBe('#757575');
  });
});

describe('sortItemsByPickupStatus', () => {
  test('should sort items with non-pickup items first', () => {
    const sorted = sortItemsByPickupStatus(mockItems, mockPickups);
    
    // Item5 should be first (not in a pickup)
    expect(sorted[0].id).toBe('item5');
    
    // Item1 and Item2 are in pickups
    expect(sorted.slice(1).map(item => item.id).sort()).toEqual(['item1', 'item2'].sort());
  });

  test('should handle empty arrays', () => {
    expect(sortItemsByPickupStatus([], mockPickups).length).toBe(0);
    expect(sortItemsByPickupStatus(mockItems, []).length).toBe(3);
    // If no pickups, all items should be considered "not in pickup"
    expect(sortItemsByPickupStatus(mockItems, []).map(item => item.id)).toEqual(mockItems.map(item => item.id));
  });

  test('should preserve original arrays', () => {
    // Make a copy to compare later
    const originalItemsOrder = [...mockItems.map(item => item.id)];
    
    // Run the sort function
    sortItemsByPickupStatus(mockItems, mockPickups);
    
    // Check original array wasn't modified
    expect(mockItems.map(item => item.id)).toEqual(originalItemsOrder);
  });
}); 