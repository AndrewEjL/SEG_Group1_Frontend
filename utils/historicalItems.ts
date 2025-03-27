import { ListedItem, PickupItem } from '../contexts/UserContext';

/**
 * Utility functions for handling historical item data
 */

/**
 * Merges basic pickup item data with detailed item data when available
 * @param pickupItem Basic pickup item with minimal information
 * @param detailedItem Optional detailed item information (may be null for historical items)
 * @returns A merged object with all available information
 */
export const mergeItemData = (
  pickupItem: PickupItem,
  detailedItem: ListedItem | null
): {
  id: string;
  name: string;
  type?: string;
  condition?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
  quantity?: string;
  address?: string;
  isHistorical: boolean;
} => {
  // If we don't have detailed information, return just the basic info
  if (!detailedItem) {
    return {
      id: pickupItem.id,
      name: pickupItem.name,
      isHistorical: true
    };
  }

  // Otherwise, return the merged data
  return {
    id: pickupItem.id,
    name: detailedItem.name,
    type: detailedItem.type,
    condition: detailedItem.condition,
    dimensions: detailedItem.dimensions,
    quantity: detailedItem.quantity,
    address: detailedItem.address,
    isHistorical: false
  };
};

/**
 * Determines if an item needs to be fetched from historical records
 * @param itemId ID of the item to check
 * @param activeItemsMap Map of active item IDs to their full data
 * @returns Boolean indicating if the item should be fetched from historical records
 */
export const needsHistoricalData = (
  itemId: string,
  activeItemsMap: { [key: string]: ListedItem }
): boolean => {
  return !activeItemsMap[itemId];
}; 