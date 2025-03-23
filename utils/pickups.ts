import { ListedItem, ScheduledPickup } from '../contexts/UserContext';

/**
 * Utility functions for pickup-related operations
 */

/**
 * Determines if an item is part of any scheduled pickup
 * @param itemId ID of the item to check
 * @param scheduledPickups List of scheduled pickups
 * @returns boolean indicating if the item is in any pickup
 */
export const isItemInPickup = (
  itemId: string, 
  scheduledPickups: ScheduledPickup[]
): boolean => {
  return scheduledPickups.some(pickup => 
    pickup.listedItemIds.includes(itemId)
  );
};

/**
 * Filters pickups based on status
 * @param pickups List of all pickups
 * @param status Status to filter by ('ongoing', 'completed', 'cancelled')
 * @returns Filtered list of pickups
 */
export const filterPickupsByStatus = (
  pickups: ScheduledPickup[], 
  status: 'ongoing' | 'completed' | 'cancelled' | 'all'
): ScheduledPickup[] => {
  if (status === 'all') {
    return pickups;
  }
  return pickups.filter(pickup => pickup.status === status);
};

/**
 * Gets the appropriate color for a pickup status
 * @param status Pickup status
 * @returns Color code for the status
 */
export const getStatusColor = (
  status: string
): string => {
  switch(status) {
    case 'completed':
      return '#4CAF50'; // Green
    case 'cancelled':
      return '#F44336'; // Red
    case 'ongoing':
      return '#FFC107'; // Yellow/Amber
    default:
      return '#757575'; // Grey
  }
};

/**
 * Sorts items by their pickup status
 * @param items List of items to sort
 * @param scheduledPickups List of scheduled pickups
 * @returns Sorted list of items
 */
export const sortItemsByPickupStatus = (
  items: ListedItem[], 
  scheduledPickups: ScheduledPickup[]
): ListedItem[] => {
  return [...items].sort((a, b) => {
    const aInPickup = isItemInPickup(a.id, scheduledPickups);
    const bInPickup = isItemInPickup(b.id, scheduledPickups);
    if (aInPickup === bInPickup) return 0;
    return aInPickup ? 1 : -1; // Items not in pickup (Listing) come first
  });
}; 