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

export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  scheduledPickups: string[];  // Array of pickup IDs - references to pickups in the database
  listedItems: string[];      // Array of listed item IDs
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
  getScheduledPickups: () => Promise<ScheduledPickup[]>;
  getPickupDetails: (pickupId: string) => Promise<ScheduledPickup | null>;
  listItem: (item: Omit<ListedItem, 'id' | 'userId' | 'createdAt'>) => Promise<boolean>;
  getListedItems: () => Promise<ListedItem[]>;
  updateListedItem: (itemId: string, updatedItem: Omit<ListedItem, 'id' | 'userId' | 'createdAt'>) => Promise<boolean>;
  deleteListedItem: (itemId: string) => Promise<boolean>;
  getHistoricalItemDetails: (itemId: string) => Promise<ListedItem | null>;
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
  getScheduledPickups: (userId: string) => Promise<ScheduledPickup[]>;
  getPickupDetails: (pickupId: string) => Promise<ScheduledPickup | null>;
  listItem: (userId: string, item: Omit<ListedItem, 'id' | 'userId' | 'createdAt'>) => Promise<boolean>;
  getListedItems: (userId: string) => Promise<ListedItem[]>;
  updateListedItem: (itemId: string, updatedItem: Omit<ListedItem, 'id' | 'userId' | 'createdAt'>) => Promise<boolean>;
  deleteListedItem: (itemId: string) => Promise<boolean>;
  getHistoricalItemDetails: (itemId: string) => Promise<ListedItem | null>;
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

const mockPickups: { [key: string]: ScheduledPickup } = {
  'pickup1': {
    id: 'pickup1',
    facilityName: 'Facility A',
    items: [
      { id: 'item1', name: 'S24 Ultra' },
      { id: 'item2', name: 'S24' },
      { id: 'item3', name: 'S24 Plus' },
    ],
    listedItemIds: ['item1', 'item2', 'item3'],  // All items are listed items
    status: 'ongoing'
  },
  'pickup2': {
    id: 'pickup2',
    facilityName: 'Facility B',
    items: [
      { id: 'item4', name: 'iPhone 15' },
    ],
    listedItemIds: ['item4'],  // This item is a listed item
    status: 'ongoing'
  },
  'pickup3': {
    id: 'pickup3',
    facilityName: 'Facility A',
    items: [
      { id: 'item5', name: 'Dell Laptop' },
    ],
    listedItemIds: ['item5'],
    status: 'completed'
  },
  'pickup4': {
    id: 'pickup4',
    facilityName: 'Facility C',
    items: [
      { id: 'item6', name: 'HP Printer' },
    ],
    listedItemIds: ['item6'],
    status: 'cancelled'
  }
};

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
        scheduledPickups: ['pickup1', 'pickup2'],
        listedItems: ['item1']
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
      // Check if the item is part of any pickup
      const isInPickup = Object.values(mockPickups).some(pickup => 
        pickup.listedItemIds.includes(itemId)
      );
      
      // Only allow deletion if the item is not in a pickup
      if (!isInPickup) {
        // Keep a copy in the historical items before deleting from active listings
        // In a real database, this would be a soft delete with a "deleted" flag
        delete mockListedItems[itemId];
        return true;
      }
    }
    return false;
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

  return (
    <UserContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register,
      updatePoints,
      getScheduledPickups,
      getPickupDetails,
      listItem,
      getListedItems,
      updateListedItem,
      deleteListedItem,
      getHistoricalItemDetails,
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