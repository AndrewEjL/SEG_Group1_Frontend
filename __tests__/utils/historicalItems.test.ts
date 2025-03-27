import { mergeItemData, needsHistoricalData } from '../../utils/historicalItems';
import { ListedItem, PickupItem } from '../../contexts/UserContext';

describe('mergeItemData', () => {
  // Sample data for testing
  const pickupItem: PickupItem = {
    id: 'item1',
    name: 'Test Item'
  };

  const detailedItem: ListedItem = {
    id: 'item1',
    userId: 'user1',
    name: 'Detailed Item Name',
    type: 'Smartphone',
    condition: 'Working',
    dimensions: { length: '10', width: '10', height: '5' },
    quantity: '1',
    createdAt: new Date(),
    address: 'Test Address'
  };

  test('should merge pickup item with detailed item data', () => {
    const result = mergeItemData(pickupItem, detailedItem);
    
    // Check that the result contains all detailed item data
    expect(result.id).toBe('item1');
    expect(result.name).toBe('Detailed Item Name'); // Should use detailed name
    expect(result.type).toBe('Smartphone');
    expect(result.condition).toBe('Working');
    expect(result.dimensions).toEqual({ length: '10', width: '10', height: '5' });
    expect(result.quantity).toBe('1');
    expect(result.address).toBe('Test Address');
    expect(result.isHistorical).toBe(false);
  });

  test('should handle null detailed item for historical items', () => {
    const result = mergeItemData(pickupItem, null);
    
    // Should contain only pickup item data
    expect(result.id).toBe('item1');
    expect(result.name).toBe('Test Item');
    expect(result.type).toBeUndefined();
    expect(result.condition).toBeUndefined();
    expect(result.dimensions).toBeUndefined();
    expect(result.quantity).toBeUndefined();
    expect(result.address).toBeUndefined();
    expect(result.isHistorical).toBe(true);
  });
});

describe('needsHistoricalData', () => {
  // Sample data for testing
  const activeItemsMap: { [key: string]: ListedItem } = {
    'item1': {
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
    'item2': {
      id: 'item2',
      userId: 'user1',
      name: 'Item 2',
      type: 'Type B',
      condition: 'Not Working',
      dimensions: { length: '20', width: '20', height: '20' },
      quantity: '2',
      createdAt: new Date(),
      address: 'Address 2'
    }
  };

  test('should return false for items in active items map', () => {
    expect(needsHistoricalData('item1', activeItemsMap)).toBe(false);
    expect(needsHistoricalData('item2', activeItemsMap)).toBe(false);
  });

  test('should return true for items not in active items map', () => {
    expect(needsHistoricalData('item3', activeItemsMap)).toBe(true);
    expect(needsHistoricalData('nonexistent', activeItemsMap)).toBe(true);
  });

  test('should handle empty active items map', () => {
    expect(needsHistoricalData('item1', {})).toBe(true);
  });

  // Edge cases
  test('should handle edge cases', () => {
    // Empty string
    expect(needsHistoricalData('', activeItemsMap)).toBe(true);
    
    // null map (though this shouldn't happen in practice)
    expect(() => needsHistoricalData('item1', null as any)).toThrow();
  });
}); 