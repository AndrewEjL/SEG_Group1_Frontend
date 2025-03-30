import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * IMPORTANT: Core Type Definitions
 * These types define the shape of data used throughout the application.
 * Backend team should implement their database schema to match these types.
 * DO NOT modify these types without coordinating with the frontend team.
 */

export interface PickupItem {
  id: string;
  name: string;  // e.g., "S24 Ultra"
  // Backend team can add more properties here (e.g., weight, category, etc.)
}

export interface ScheduledPickup {
  id: string;
  facilityName: string;
  items: PickupItem[];
  listedItemIds: string[];  // Array of listed item IDs that are part of this pickup
  status: 'ongoing' | 'completed' | 'cancelled'; // Status of the pickup
  date: string; // Add date field to track when pickup was scheduled/completed/cancelled
  collector?: string; // Name of the collector assigned to this pickup
  organizationId?: string; // ID of the organization that has accepted the pickup
  clientId?: string; // ID of the client who created the pickup
  pickupStatus?: 'Out for pickup' | 'Collected' | 'Recycled'; // Status for organization view
  // Backend team can add more properties here (e.g., date, status, location, etc.)
}

export interface ListedItem {
  id: string;
  userId: string;
  name: string;
  type: string;
  condition: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  quantity: string;
  createdAt: Date;
  address: string;
}

export interface RewardRedemption {
  id: string;
  name: string;
  value: string;
  pin: string;
  date: string;
  imageSource: any;
}

// Define GiftCard type for rewards system
export interface GiftCard {
  id: string;
  name: string;
  points: number;
  image: any;
  value: string;
  category: string;
  status: 'available' | 'unavailable';
}

export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  address: string;   // Adding address field
  phoneNumber: string;  // Adding phone number field
  role: 'client' | 'organization';  // Add role field to distinguish user types
  scheduledPickups: string[];  // Array of pickup IDs - references to pickups in the database
  listedItems: string[];      // Array of listed item IDs
  redeemedRewards?: RewardRedemption[];  // Array of redeemed rewards
  collectorEmployees?: string[]; // Array of collector IDs for organization
}

/**
 * FRONTEND INTERFACE - DO NOT MODIFY
 * This interface defines all the functions that the frontend expects to be able to call.
 * The implementation of these functions can be changed, but the function signatures must stay the same.
 */
interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, phoneNumber: string) => Promise<boolean>;
  updatePoints: (points: number) => Promise<boolean>;
  updateUserPoints: (points: number) => void; // Add a quick method for updating points without API call
  updateUserProfile: (data: { name?: string; email?: string; address?: string; phoneNumber?: string }) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  getScheduledPickups: () => Promise<ScheduledPickup[]>;
  getPickupDetails: (pickupId: string) => Promise<ScheduledPickup | null>;
  listItem: (item: Omit<ListedItem, 'id' | 'userId' | 'createdAt'>) => Promise<boolean>;
  getListedItems: () => Promise<ListedItem[]>;
  updateListedItem: (itemId: string, updatedItem: Omit<ListedItem, 'id' | 'userId' | 'createdAt'>) => Promise<boolean>;
  deleteListedItem: (itemId: string) => Promise<boolean>;
  getHistoricalItemDetails: (itemId: string) => Promise<ListedItem | null>;
  addRedeemedReward: (reward: RewardRedemption) => void; // Add a method to add a redeemed reward
  getRedeemedRewards: () => RewardRedemption[]; // Add a method to get redeemed rewards
  getGiftCards: () => GiftCard[]; // Add a method to get gift cards
  // New methods for organization/recipient functionality
  getAvailablePickups: () => Promise<ListedItem[]>; // Get items available for pickup (for organizations)
  getPendingPickups: () => Promise<ScheduledPickup[]>; // Get pickups that are assigned but not completed
  acceptPickup: (itemId: string, collectorName: string) => Promise<boolean>; // Accept a pickup and assign a collector - LEGACY
  acceptMultiplePickups: (itemIds: string[], collectorName: string) => Promise<boolean>; // Accept multiple items in one pickup
  updatePickupStatus: (pickupId: string, status: 'Out for pickup' | 'Collected' | 'Recycled') => Promise<boolean>;
  getCollectors: () => Promise<{label: string, value: string}[]>; // Get list of collectors for an organization
  addCollector: (name: string, email: string, phoneNumber: string, password: string) => Promise<boolean>; // Add a collector to the organization
  removeCollector: (id: string) => Promise<boolean>; // Remove a collector from the organization
  getOrganizationName: (organizationId: string) => Promise<string>; // Get organization name by ID
}

/**
 * BACKEND IMPLEMENTATION INTERFACE
 * This is the interface that the backend team needs to implement.
 * Replace the mock implementation below with real database calls.
 * The function signatures must match this interface exactly.
 */
interface UserService {
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, phoneNumber: string) => Promise<boolean>;
  updatePoints: (userId: string, points: number) => Promise<boolean>;
  updateUserProfile: (userId: string, data: { name?: string; email?: string; address?: string; phoneNumber?: string }) => Promise<boolean>;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>;
  getScheduledPickups: (userId: string) => Promise<ScheduledPickup[]>;
  getPickupDetails: (pickupId: string) => Promise<ScheduledPickup | null>;
  listItem: (userId: string, item: Omit<ListedItem, 'id' | 'userId' | 'createdAt'>) => Promise<boolean>;
  getListedItems: (userId: string) => Promise<ListedItem[]>;
  updateListedItem: (itemId: string, updatedItem: Omit<ListedItem, 'id' | 'userId' | 'createdAt'>) => Promise<boolean>;
  deleteListedItem: (itemId: string) => Promise<boolean>;
  getHistoricalItemDetails: (itemId: string) => Promise<ListedItem | null>;
  addRedeemedReward: (userId: string, reward: RewardRedemption) => Promise<boolean>; // Add method to save redeemed reward
  // New methods for organization functionality
  getAvailablePickups: () => Promise<ListedItem[]>;
  getPendingPickups: (organizationId: string) => Promise<ScheduledPickup[]>;
  acceptPickup: (itemId: string, organizationId: string, collectorName: string) => Promise<boolean>;
  acceptMultiplePickups: (itemIds: string[], organizationId: string, collectorName: string) => Promise<boolean>;
  updatePickupStatus: (pickupId: string, status: 'Out for pickup' | 'Collected' | 'Recycled') => Promise<boolean>;
  getCollectors: (organizationId: string) => Promise<{id: string, name: string, email: string, phoneNumber: string}[]>;
  addCollector: (organizationId: string, name: string, email: string, phoneNumber: string, password: string) => Promise<boolean>;
  removeCollector: (collectorId: string) => Promise<boolean>;
  getOrganizationName: (organizationId: string) => Promise<string>; // Get organization name by ID
}

/**
 * MOCK DATA - FOR DEVELOPMENT ONLY
 * This section contains mock data used for frontend development.
 * Backend team should remove this and replace with real database implementation.
 */

// Mock data for listed items
const mockListedItems: { [key: string]: ListedItem } = {
  'item1': {
    id: 'item1',
    userId: '1',
    name: 'S24 Ultra',
    type: 'Smartphone',
    condition: 'Working',
    dimensions: { length: '20', width: '10', height: '5' },
    quantity: '1',
    createdAt: new Date(),
    address: 'Jalan Dato Sulaiman, Taman Century, 80250 Johor Bahru, Johor, Malaysia',
  },
  'item2': {
    id: 'item2',
    userId: '1',
    name: 'S24',
    type: 'Smartphone',
    condition: 'Partially Working',
    dimensions: { length: '15', width: '8', height: '5' },
    quantity: '1',
    createdAt: new Date(),
    address: 'Jalan Tebrau, Taman Maju, 80300 Johor Bahru, Johor, Malaysia',
  },
  'item3': {
    id: 'item3',
    userId: '1',
    name: 'S24 Plus',
    type: 'Smartphone',
    condition: 'Not Working',
    dimensions: { length: '18', width: '9', height: '5' },
    quantity: '2',
    createdAt: new Date(),
    address: 'Jalan Stulang Laut, Stulang, 80300 Johor Bahru, Johor, Malaysia',
  },
  'item4': {
    id: 'item4',
    userId: '1',
    name: 'iPhone 15',
    type: 'Smartphone',
    condition: 'Working',
    dimensions: { length: '15', width: '7', height: '4' },
    quantity: '1',
    createdAt: new Date(),
    address: 'Jalan Tun Abdul Razak, Larkin, 80350 Johor Bahru, Johor, Malaysia',
  },
  // Adding new items that will show as available pickups in RHomeScreen
  'item7': {
    id: 'item7',
    userId: '1',
    name: 'MacBook Pro',
    type: 'Laptop',
    condition: 'Working',
    dimensions: { length: '35', width: '25', height: '2' },
    quantity: '1',
    createdAt: new Date(),
    address: 'Jalan Indah 15, Taman Bukit Indah, 81200 Johor Bahru, Johor, Malaysia',
  },
  'item8': {
    id: 'item8',
    userId: '1',
    name: 'iPad Pro',
    type: 'Tablet',
    condition: 'Partially Working',
    dimensions: { length: '28', width: '21', height: '1' },
    quantity: '1',
    createdAt: new Date(),
    address: 'Jalan Bayu Puteri 1, Taman Bayu Puteri, 80150 Johor Bahru, Johor, Malaysia',
  },
  'item9': {
    id: 'item9',
    userId: '1',
    name: 'Google Pixel 7',
    type: 'Smartphone',
    condition: 'Working',
    dimensions: { length: '16', width: '7', height: '1' },
    quantity: '1',
    createdAt: new Date(),
    address: 'Jalan Molek 1, Taman Molek, 81100 Johor Bahru, Johor, Malaysia',
  },
  // Adding a new item with the same address as items 1, 2, 3 to demonstrate multi-item pickup
  'item10': {
    id: 'item10',
    userId: '1',
    name: 'Samsung Galaxy Tab S9',
    type: 'Tablet',
    condition: 'Working',
    dimensions: { length: '30', width: '20', height: '0.8' },
    quantity: '1',
    createdAt: new Date(),
    address: 'Jalan Dato Sulaiman, Taman Century, 80250 Johor Bahru, Johor, Malaysia', // Same address as item1
  },
  // Add a new item with the same address as item1 and item10 for multi-item pickup testing
  'item11': {
    id: 'item11',
    userId: '1',
    name: 'Samsung Galaxy Watch 6',
    type: 'Smartwatch',
    condition: 'Working',
    dimensions: { length: '5', width: '5', height: '1.5' },
    quantity: '1',
    createdAt: new Date(),
    address: 'Jalan Dato Sulaiman, Taman Century, 80250 Johor Bahru, Johor, Malaysia', // Same address as item1 and item10
  },
};

// Historical record of all items, including those no longer in active listings
// In a real database, these would be archived items with a "deleted" flag
const mockHistoricalItems: { [key: string]: ListedItem } = {
  // Include all current items
  ...mockListedItems,
  // Add items that are in historical pickups but no longer in active listings
  'item5': {
    id: 'item5',
    userId: '1',
    name: 'Dell Laptop',
    type: 'Laptop',
    condition: 'Working',
    dimensions: { length: '35', width: '25', height: '2' },
    quantity: '1',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    address: 'Jalan Bakawali 54, Taman Johor Jaya, 81100 Johor Bahru, Johor, Malaysia',
  },
  'item6': {
    id: 'item6',
    userId: '1',
    name: 'HP Printer',
    type: 'Printer',
    condition: 'Not Working',
    dimensions: { length: '45', width: '35', height: '20' },
    quantity: '1',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    address: 'Jalan Perang, Taman Pelangi, 80400 Johor Bahru, Johor, Malaysia',
  },
};

// Add this mock organization map for the mockUserService
const mockOrganizations: { [key: string]: User } = {
  '2': {
    id: '2',
    name: 'GreenTech Recyclers',
    email: 'org@example.com',
    points: 0,
    address: '456 Business Ave, City',
    phoneNumber: '+601244445555',
    role: 'organization',
    scheduledPickups: ['pickup1', 'pickup5', 'pickup6'],
    listedItems: [],
  },
  '3': {
    id: '3',
    name: 'EcoLife Solutions',
    email: 'eco@example.com',
    points: 0,
    address: '789 Sustainability St, City',
    phoneNumber: '+601244446666',
    role: 'organization',
    scheduledPickups: ['pickup2'],
    listedItems: [],
  },
  '4': {
    id: '4',
    name: 'ReNew Electronics',
    email: 'renew@example.com',
    points: 0,
    address: '101 Innovation Blvd, City',
    phoneNumber: '+601244447777',
    role: 'organization',
    scheduledPickups: ['pickup3', 'pickup4'],
    listedItems: [],
  }
};

const mockPickups: { [key: string]: ScheduledPickup } = {
  'pickup1': {
    id: 'pickup1',
    facilityName: 'GreenTech Recyclers',
    items: [
      { id: 'item1', name: 'S24 Ultra' },
      { id: 'item10', name: 'Samsung Galaxy Tab S9' },
    ],
    listedItemIds: ['item1', 'item10'],  // Both items are at the same address
    status: 'ongoing',
    date: new Date().toISOString(), // Today
    organizationId: '2', // Assign to the organization
    clientId: '1',
    collector: 'John Doe',
    pickupStatus: 'Out for pickup'
  },
  'pickup2': {
    id: 'pickup2',
    facilityName: 'EcoLife Solutions',
    items: [
      { id: 'item4', name: 'iPhone 15' },
    ],
    listedItemIds: ['item4'],  // This item is a listed item
    status: 'ongoing',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    organizationId: '3', // Assign to the different organization
    clientId: '1',
    collector: 'Jane Smith',
    pickupStatus: 'Collected'
  },
  'pickup3': {
    id: 'pickup3',
    facilityName: 'ReNew Electronics',
    items: [
      { id: 'item5', name: 'Dell Laptop' },
    ],
    listedItemIds: ['item5'],
    status: 'completed',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    organizationId: '4', // Assign to a different organization
    clientId: '1',
    collector: 'Michael Brown'
  },
  'pickup4': {
    id: 'pickup4',
    facilityName: 'ReNew Electronics',
    items: [
      { id: 'item6', name: 'HP Printer' },
    ],
    listedItemIds: ['item6'],
    status: 'cancelled',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    organizationId: '4', // Same organization as pickup3
    clientId: '1',
    collector: 'John Doe'
  },
  'pickup5': {
    id: 'pickup5',
    facilityName: 'GreenTech Recyclers',
    items: [
      { id: 'item2', name: 'S24' },
    ],
    listedItemIds: ['item2'],
    status: 'ongoing',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    organizationId: '2',
    clientId: '1',
    collector: 'Jane Smith',
    pickupStatus: 'Out for pickup'
  },
  'pickup6': {
    id: 'pickup6',
    facilityName: 'GreenTech Recyclers',
    items: [
      { id: 'item3', name: 'S24 Plus' },
    ],
    listedItemIds: ['item3'],
    status: 'ongoing',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    organizationId: '2',
    clientId: '1',
    collector: 'Michael Brown',
    pickupStatus: 'Out for pickup'
  }
};

// Gift card data - moved from RewardsScreen
const giftCardData: GiftCard[] = [
  { id: '1', name: 'Touch \'n Go eWallet RM5', points: 50, image: require('../screens/assets/TnG_Icon.png'), value: 'RM5', category: 'Gift Cards', status: 'available' },
  { id: '2', name: 'Touch \'n Go eWallet RM15', points: 150, image: require('../screens/assets/TnG_Icon.png'), value: 'RM15', category: 'Gift Cards', status: 'available' },
  { id: '3', name: 'Touch \'n Go eWallet RM30', points: 300, image: require('../screens/assets/TnG_Icon.png'), value: 'RM30', category: 'Gift Cards', status: 'available' },
  { id: '4', name: 'Touch \'n Go eWallet RM50', points: 500, image: require('../screens/assets/TnG_Icon.png'), value: 'RM50', category: 'Gift Cards', status: 'unavailable' },
  { id: '5', name: 'Touch \'n Go eWallet RM100', points: 1000, image: require('../screens/assets/TnG_Icon.png'), value: 'RM100', category: 'Gift Cards', status: 'unavailable' },
];

// Mock data for organization employees (collectors)
const mockCollectors = [
  { id: 'collector1', name: 'John Doe', email: 'john@example.com', phoneNumber: '+60123456789'},
  { id: 'collector2', name: 'Jane Smith', email: 'jane@example.com', phoneNumber: '+60123456780'},
  { id: 'collector3', name: 'Michael Brown', email: 'michael@example.com', phoneNumber: '+60123456781'},
];

/**
 * MOCK SERVICE IMPLEMENTATION - REPLACE WITH REAL DATABASE IMPLEMENTATION
 * Backend team: Replace this entire mockUserService with your real service implementation
 * that connects to your database. The function signatures must stay the same,
 * but the implementation can change.
 */
const mockUserService: UserService = {
  login: async (email: string, password: string) => {
    // Replace with real authentication logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'test@example.com' && password === 'password') {
      return {
        id: '1',
        name: 'John Doe',
        email: 'test@example.com',
        points: 150,
        address: '123 Main St, City',
        phoneNumber: '+601233335555',
        role: 'client', // Client user
        scheduledPickups: ['pickup1', 'pickup2', 'pickup3', 'pickup4', 'pickup5', 'pickup6'], // All pickups for this client
        listedItems: ['item1', 'item2', 'item3', 'item4', 'item7', 'item8', 'item9', 'item10', 'item11'], // All listed items for this client
        redeemedRewards: [
          {
            id: 'reward1',
            name: 'Touch \'n Go eWallet RM15',
            value: 'RM15',
            pin: '1234567890',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            imageSource: null, // Will be set properly when displayed
          },
          {
            id: 'reward2',
            name: 'Touch \'n Go eWallet RM5',
            value: 'RM5',
            pin: '0987654321',
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
            imageSource: null, // Will be set properly when displayed
          }
        ]
      };
    } else if (email === 'org@example.com' && password === 'password') {
      return {
        id: '2',
        name: 'GreenTech Recyclers',
        email: 'org@example.com',
        points: 0,
        address: '456 Business Ave, City',
        phoneNumber: '+601244445555',
        role: 'organization', // Organization user
        scheduledPickups: ['pickup1', 'pickup5', 'pickup6'], // Pickups assigned to this organization
        listedItems: [],
        redeemedRewards: [],
        collectorEmployees: ['collector1', 'collector2', 'collector3'] // Reference to collectors
      };
    } else if (email === 'eco@example.com' && password === 'password') {
      return {
        id: '3',
        name: 'EcoLife Solutions',
        email: 'eco@example.com',
        points: 0,
        address: '789 Sustainability St, City',
        phoneNumber: '+601244446666',
        role: 'organization',
        scheduledPickups: ['pickup2'],
        listedItems: [],
        redeemedRewards: [],
        collectorEmployees: ['collector1', 'collector2']
      };
    } else if (email === 'renew@example.com' && password === 'password') {
      return {
        id: '4',
        name: 'ReNew Electronics',
        email: 'renew@example.com',
        points: 0,
        address: '101 Innovation Blvd, City',
        phoneNumber: '+601244447777',
        role: 'organization',
        scheduledPickups: ['pickup3', 'pickup4'],
        listedItems: [],
        redeemedRewards: [],
        collectorEmployees: ['collector3']
      };
    }
    return null;
  },

  logout: async () => {
    // Replace with real logout logic (e.g., invalidate session)
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  register: async (name: string, email: string, password: string, phoneNumber: string) => {
    // Replace with real registration logic that connects to your database
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, you would:
    // 1. Check if the email already exists
    // 2. Hash the password
    // 3. Create a new user record in the database
    // 4. Return success/failure
    
    // For now, we'll just simulate success
    console.log('Registered user:', { name, email, phoneNumber });
    return true;
  },

  updatePoints: async (userId: string, points: number) => {
    // Replace with real database update
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  },

  updateUserProfile: async (userId: string, data: { name?: string; email?: string; address?: string; phoneNumber?: string }) => {
    // Replace with real database update
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  },

  changePassword: async (userId: string, currentPassword: string, newPassword: string) => {
    // Replace with real password validation and update logic
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real implementation, you would verify the current password
    // and update with the hashed new password in the database
    return true;
  },

  getScheduledPickups: async (userId: string) => {
    // Replace with real database query
    await new Promise(resolve => setTimeout(resolve, 500));
    return Object.values(mockPickups);
  },

  getPickupDetails: async (pickupId: string) => {
    // Replace with real database query
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPickups[pickupId] || null;
  },

  getHistoricalItemDetails: async (itemId: string) => {
    // In a real database, you would fetch from the historical records
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockHistoricalItems[itemId] || null;
  },

  listItem: async (userId: string, item: Omit<ListedItem, 'id' | 'userId' | 'createdAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const itemId = `item${Object.keys(mockListedItems).length + 1}`;
    mockListedItems[itemId] = {
      ...item,
      id: itemId,
      userId,
      createdAt: new Date(),
    };
    // Also add to historical items collection
    mockHistoricalItems[itemId] = mockListedItems[itemId];
    return true;
  },

  getListedItems: async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Object.values(mockListedItems).filter(item => item.userId === userId);
  },

  updateListedItem: async (itemId: string, updatedItem: Omit<ListedItem, 'id' | 'userId' | 'createdAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (mockListedItems[itemId]) {
      mockListedItems[itemId] = {
        ...mockListedItems[itemId],
        ...updatedItem,
      };
      // Also update in historical items
      mockHistoricalItems[itemId] = mockListedItems[itemId];
      return true;
    }
    return false;
  },
  
  deleteListedItem: async (itemId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if the item exists
    if (mockListedItems[itemId]) {
      // Check if the item is part of any ONGOING pickup (allow deletion for completed/cancelled)
      const isInActivePickup = Object.values(mockPickups).some(pickup => 
        pickup.listedItemIds.includes(itemId) && pickup.status === 'ongoing'
      );
      
      // Only allow deletion if the item is not in an active pickup
      if (!isInActivePickup) {
        // Keep a copy in the historical items before deleting from active listings
        // In a real database, this would be a soft delete with a "deleted" flag
        delete mockListedItems[itemId];
        return true;
      }
    }
    return false;
  },

  addRedeemedReward: async (userId: string, reward: RewardRedemption) => {
    // In a real implementation, you would save this to the database
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  },

  getAvailablePickups: async () => {
    // Simulates getting items that are available for pickup (not yet assigned to any organization)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return items that are not part of any ongoing pickup
    return Object.values(mockListedItems).filter(item => {
      // Check if the item is not in any ongoing pickup
      const isInAnyOngoingPickup = Object.values(mockPickups).some(pickup => 
        pickup.listedItemIds.includes(item.id) && pickup.status === 'ongoing'
      );
      
      // Return true if the item is not in any ongoing pickup
      return !isInAnyOngoingPickup;
    });
  },
  
  getPendingPickups: async (organizationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return pickups that are assigned to this organization and are ongoing
    return Object.values(mockPickups).filter(pickup => 
      pickup.organizationId === organizationId && 
      pickup.status === 'ongoing'
    );
  },
  
  acceptPickup: async (itemId: string, organizationId: string, collectorName: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get the item details
    const item = mockListedItems[itemId];
    if (!item) return false;
    
    // Check if there's an existing ongoing pickup with the same address
    const existingPickup = Object.values(mockPickups).find(pickup => 
      pickup.status === 'ongoing' && 
      pickup.organizationId === organizationId &&
      pickup.collector === collectorName &&
      // Check if any item in this pickup has the same address
      pickup.listedItemIds.some(id => mockListedItems[id]?.address === item.address)
    );
    
    if (existingPickup) {
      // Add the item to the existing pickup
      existingPickup.items.push({ id: item.id, name: item.name });
      existingPickup.listedItemIds.push(item.id);
      return true;
    } else {
      // Create a new pickup for this item
      const pickupId = `pickup${Object.keys(mockPickups).length + 1}`;
      const organization = mockOrganizations[organizationId];
      
      mockPickups[pickupId] = {
        id: pickupId,
        facilityName: organization?.name || 'Unknown Organization', // Use the actual organization name
        items: [{ id: item.id, name: item.name }],
        listedItemIds: [item.id],
        status: 'ongoing',
        date: new Date().toISOString(),
        collector: collectorName,
        organizationId: organizationId,
        clientId: item.userId,
        pickupStatus: 'Out for pickup'
      };
      
      return true;
    }
  },
  
  acceptMultiplePickups: async (itemIds: string[], organizationId: string, collectorName: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify all items exist and get their details
    const items = itemIds.map(id => mockListedItems[id]).filter(item => item !== undefined);
    
    // If no valid items found, return false
    if (items.length === 0) return false;
    
    // Check if all items belong to the same user/client
    const clientId = items[0].userId;
    const allSameClient = items.every(item => item.userId === clientId);
    
    if (!allSameClient) {
      console.error("Cannot create pickup with items from different clients");
      return false;
    }
    
    // Group items by address
    const itemsByAddress = items.reduce((groups, item) => {
      if (!groups[item.address]) {
        groups[item.address] = [];
      }
      groups[item.address].push(item);
      return groups;
    }, {} as { [address: string]: ListedItem[] });
    
    // Process each address group
    for (const [address, addressItems] of Object.entries(itemsByAddress)) {
      // Check if there's an existing pickup with this address
      const existingPickup = Object.values(mockPickups).find(pickup => 
        pickup.status === 'ongoing' && 
        pickup.organizationId === organizationId &&
        pickup.collector === collectorName &&
        // Check if any item in this pickup has the same address
        pickup.listedItemIds.some(id => mockListedItems[id]?.address === address)
      );
      
      if (existingPickup) {
        // Add items to existing pickup
        for (const item of addressItems) {
          if (!existingPickup.listedItemIds.includes(item.id)) {
            existingPickup.items.push({ id: item.id, name: item.name });
            existingPickup.listedItemIds.push(item.id);
          }
        }
      } else {
        // Create a new pickup for these items
        const pickupId = `pickup${Object.keys(mockPickups).length + 1}`;
        const organization = mockOrganizations[organizationId];
        
        mockPickups[pickupId] = {
          id: pickupId,
          facilityName: organization?.name || 'Unknown Organization',
          items: addressItems.map(item => ({ id: item.id, name: item.name })),
          listedItemIds: addressItems.map(item => item.id),
          status: 'ongoing',
          date: new Date().toISOString(),
          collector: collectorName,
          organizationId: organizationId,
          clientId: clientId,
          pickupStatus: 'Out for pickup'
        };
      }
    }
    
    return true;
  },
  
  updatePickupStatus: async (pickupId: string, status: 'Out for pickup' | 'Collected' | 'Recycled') => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (mockPickups[pickupId]) {
      mockPickups[pickupId] = {
        ...mockPickups[pickupId],
        pickupStatus: status
      };
      return true;
    }
    return false;
  },
  
  getCollectors: async (organizationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real implementation, we would filter collectors by organization ID
    return mockCollectors;
  },
  
  addCollector: async (organizationId: string, name: string, email: string, phoneNumber: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if email already exists
    const emailExists = mockCollectors.some(c => c.email === email);
    if (emailExists) return false;
    
    const collectorId = `collector${mockCollectors.length + 1}`;
    mockCollectors.push({
      id: collectorId,
      name,
      email,
      phoneNumber
    });
    
    return true;
  },
  
  removeCollector: async (collectorId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockCollectors.findIndex(c => c.id === collectorId);
    if (index !== -1) {
      mockCollectors.splice(index, 1);
      return true;
    }
    return false;
  },

  getOrganizationName: async (organizationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOrganizations[organizationId]?.name || 'Unknown Organization';
  },
};

/**
 * CONTEXT CREATION - DO NOT MODIFY
 * This section creates the React Context and is used by the frontend.
 * Backend team should not modify this section.
 */
const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * PROVIDER COMPONENT - MODIFY ONLY THE SERVICE IMPLEMENTATION
 * This component provides user data and functions to the rest of the app.
 * Backend team should only replace 'mockUserService' with their real service.
 * The rest of this component should not be modified.
 */
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Backend team: Replace mockUserService with your real service implementation
  const userService = mockUserService;

  const login = async (email: string, password: string) => {
    try {
      const userData = await userService.login(email, password);
      if (userData) {
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await userService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (name: string, email: string, password: string, phoneNumber: string) => {
    try {
      return await userService.register(name, email, password, phoneNumber);
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const updatePoints = async (points: number) => {
    if (!user) return false;
    
    try {
      const success = await userService.updatePoints(user.id, points);
      if (success) {
        setUser(prev => prev ? { ...prev, points } : null);
      }
      return success;
    } catch (error) {
      console.error('Update points error:', error);
      return false;
    }
  };

  const updateUserProfile = async (data: { name?: string; email?: string; address?: string; phoneNumber?: string }) => {
    if (!user) return false;
    
    try {
      const success = await userService.updateUserProfile(user.id, data);
      if (success) {
        setUser(prev => prev ? { ...prev, ...data } : null);
      }
      return success;
    } catch (error) {
      console.error('Update user profile error:', error);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return false;
    
    try {
      return await userService.changePassword(user.id, currentPassword, newPassword);
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  };

  const getScheduledPickups = async () => {
    if (!user) return [];
    try {
      return await userService.getScheduledPickups(user.id);
    } catch (error) {
      console.error('Get scheduled pickups error:', error);
      return [];
    }
  };

  const getPickupDetails = async (pickupId: string) => {
    return userService.getPickupDetails(pickupId);
  };

  const getHistoricalItemDetails = async (itemId: string) => {
    return userService.getHistoricalItemDetails(itemId);
  };

  const listItem = async (item: Omit<ListedItem, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return false;
    try {
      return await userService.listItem(user.id, item);
    } catch (error) {
      console.error('List item error:', error);
      return false;
    }
  };

  const getListedItems = async () => {
    if (!user) return [];
    try {
      return await userService.getListedItems(user.id);
    } catch (error) {
      console.error('Get listed items error:', error);
      return [];
    }
  };

  const updateListedItem = async (itemId: string, updatedItem: Omit<ListedItem, 'id' | 'userId' | 'createdAt'>) => {
    try {
      return await userService.updateListedItem(itemId, updatedItem);
    } catch (error) {
      console.error('Update listed item error:', error);
      return false;
    }
  };
  
  const deleteListedItem = async (itemId: string) => {
    try {
      return await userService.deleteListedItem(itemId);
    } catch (error) {
      console.error('Delete listed item error:', error);
      return false;
    }
  };

  // Add a direct method to update points without an API call (for quicker UI updates)
  const updateUserPoints = (points: number) => {
    setUser(prev => prev ? { ...prev, points } : null);
  };

  // Add a method to add a redeemed reward
  const addRedeemedReward = (reward: RewardRedemption) => {
    setUser(prev => {
      if (!prev) return null;
      
      // Create a new array with existing rewards + new reward
      const updatedRewards = prev.redeemedRewards 
        ? [...prev.redeemedRewards, reward] 
        : [reward];
      
      // Create a new user object with the updated rewards
      return {
        ...prev,
        redeemedRewards: updatedRewards
      };
    });

    // In a production app, we would also save this to the database
    if (user) {
      userService.addRedeemedReward(user.id, reward)
        .catch(error => console.error('Error saving redeemed reward:', error));
    }
  };

  // Add a method to get redeemed rewards
  const getRedeemedRewards = (): RewardRedemption[] => {
    return user?.redeemedRewards || [];
  };

  // Add a method to get gift cards
  const getGiftCards = (): GiftCard[] => {
    return giftCardData;
  };

  const getAvailablePickups = async () => {
    try {
      return await userService.getAvailablePickups();
    } catch (error) {
      console.error('Get available pickups error:', error);
      return [];
    }
  };

  const getPendingPickups = async () => {
    if (!user) return [];
    try {
      return await userService.getPendingPickups(user.id);
    } catch (error) {
      console.error('Get pending pickups error:', error);
      return [];
    }
  };

  const acceptPickup = async (itemId: string, collectorName: string) => {
    if (!user) return false;
    try {
      return await userService.acceptPickup(itemId, user.id, collectorName);
    } catch (error) {
      console.error('Accept pickup error:', error);
      return false;
    }
  };

  const acceptMultiplePickups = async (itemIds: string[], collectorName: string) => {
    if (!user) return false;
    try {
      return await userService.acceptMultiplePickups(itemIds, user.id, collectorName);
    } catch (error) {
      console.error('Accept multiple pickups error:', error);
      return false;
    }
  };

  const updatePickupStatus = async (pickupId: string, status: 'Out for pickup' | 'Collected' | 'Recycled') => {
    try {
      return await userService.updatePickupStatus(pickupId, status);
    } catch (error) {
      console.error('Update pickup status error:', error);
      return false;
    }
  };

  const getCollectors = async () => {
    if (!user) return [];
    try {
      const collectors = await userService.getCollectors(user.id);
      return collectors.map(c => ({ label: c.name, value: c.name }));
    } catch (error) {
      console.error('Get collectors error:', error);
      return [];
    }
  };

  const addCollector = async (name: string, email: string, phoneNumber: string, password: string) => {
    if (!user) return false;
    try {
      return await userService.addCollector(user.id, name, email, phoneNumber, password);
    } catch (error) {
      console.error('Add collector error:', error);
      return false;
    }
  };

  const removeCollector = async (id: string) => {
    try {
      return await userService.removeCollector(id);
    } catch (error) {
      console.error('Remove collector error:', error);
      return false;
    }
  };

  const getOrganizationName = async (organizationId: string) => {
    try {
      return await userService.getOrganizationName(organizationId);
    } catch (error) {
      console.error('Get organization name error:', error);
      return 'Unknown Organization';
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register,
      updatePoints,
      updateUserPoints,
      updateUserProfile,
      changePassword,
      getScheduledPickups,
      getPickupDetails,
      listItem,
      getListedItems,
      updateListedItem,
      deleteListedItem,
      getHistoricalItemDetails,
      addRedeemedReward,
      getRedeemedRewards,
      getGiftCards,
      // New methods
      getAvailablePickups,
      getPendingPickups,
      acceptPickup,
      acceptMultiplePickups,
      updatePickupStatus,
      getCollectors,
      addCollector,
      removeCollector,
      getOrganizationName
    }}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * UTILITY HOOKS AND COMPONENTS - DO NOT MODIFY
 * These are used by the frontend and should not be changed.
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Development-only component for auto-login - can be removed in production
export const DevAutoLogin: React.FC = () => {
  const { login } = useUser();
  
  React.useEffect(() => {
    login('test@example.com', 'password');
  }, []);
  
  return null;
};

// Add a development-only component for organization auto-login
export const DevOrgAutoLogin: React.FC = () => {
  const { login } = useUser();
  
  React.useEffect(() => {
    login('org@example.com', 'password');
  }, []);
  
  return null;
}; 