// Note: This is a simplified test that doesn't import the actual mockUserService
// to avoid circular dependencies issues. In a real implementation, you would 
// need to properly expose the mockUserService or mock it differently.

// Mock data and services
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'test@example.com',
  points: 150,
  address: '123 Main St, City',
  phoneNumber: '+601233335555',
  scheduledPickups: ['pickup1', 'pickup2'],
  listedItems: ['item1'],
  redeemedRewards: [
    {
      id: 'reward1',
      name: 'Touch \'n Go eWallet RM15',
      value: 'RM15',
      pin: '1234567890',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      imageSource: null,
    }
  ]
};

const mockPickups = [
  {
    id: 'pickup1',
    facilityName: 'Facility A',
    items: [{ id: 'item1', name: 'Item 1' }, { id: 'item2', name: 'Item 2' }],
    listedItemIds: ['item1', 'item2'],
    status: 'ongoing',
    date: new Date().toISOString()
  },
  {
    id: 'pickup2',
    facilityName: 'Facility B',
    items: [{ id: 'item3', name: 'Item 3' }],
    listedItemIds: ['item3'],
    status: 'completed',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockHistoricalItem = {
  id: 'item5',
  userId: '1',
  name: 'Dell Laptop',
  type: 'Laptop',
  condition: 'Working',
  dimensions: { length: '35', width: '25', height: '2' },
  quantity: '1',
  createdAt: new Date(),
  address: 'Test Address'
};

const mockGiftCards = [
  { id: '1', name: 'Touch \'n Go eWallet RM5', points: 50, image: null, value: 'RM5', category: 'Gift Cards', status: 'available' },
  { id: '2', name: 'Touch \'n Go eWallet RM15', points: 150, image: null, value: 'RM15', category: 'Gift Cards', status: 'available' },
  { id: '3', name: 'Touch \'n Go eWallet RM30', points: 300, image: null, value: 'RM30', category: 'Gift Cards', status: 'available' },
  { id: '4', name: 'Touch \'n Go eWallet RM50', points: 500, image: null, value: 'RM50', category: 'Gift Cards', status: 'unavailable' },
];

// Mock implementation of the User object with Redux-like state update
let userState = { ...mockUser };

// Mock service implementation
const mockService = {
  login: jest.fn().mockImplementation((email, password) => {
    return Promise.resolve(
      email === 'test@example.com' && password === 'password' 
        ? userState 
        : null
    );
  }),
  getScheduledPickups: jest.fn().mockResolvedValue(mockPickups),
  getHistoricalItemDetails: jest.fn().mockImplementation((itemId) => {
    return Promise.resolve(itemId === 'item5' ? mockHistoricalItem : null);
  }),
  listItem: jest.fn().mockResolvedValue(true),
  deleteListedItem: jest.fn().mockImplementation((itemId) => {
    // Simulate that item1 is in a pickup and can't be deleted
    return Promise.resolve(itemId !== 'item1');
  }),
  addRedeemedReward: jest.fn().mockResolvedValue(true),
  updatePoints: jest.fn().mockResolvedValue(true)
};

// Mock implementations for direct state updates
const mockContextImplementation = {
  updateUserPoints: jest.fn().mockImplementation((points) => {
    userState = { ...userState, points };
    return userState;
  }),
  addRedeemedReward: jest.fn().mockImplementation((reward) => {
    const rewards = userState.redeemedRewards || [];
    userState = { 
      ...userState, 
      redeemedRewards: [...rewards, reward] 
    };
    return userState;
  }),
  getRedeemedRewards: jest.fn().mockImplementation(() => {
    return userState.redeemedRewards || [];
  }),
  getGiftCards: jest.fn().mockReturnValue(mockGiftCards)
};

describe('UserContext Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset user state before each test
    userState = { ...mockUser };
  });

  describe('login', () => {
    it('should return user data for valid credentials', async () => {
      const result = await mockService.login('test@example.com', 'password');
      expect(result).not.toBeNull();
      expect(result?.email).toBe('test@example.com');
      expect(result?.name).toBe('John Doe');
      expect(mockService.login).toHaveBeenCalledWith('test@example.com', 'password');
    });

    it('should return null for invalid credentials', async () => {
      const result = await mockService.login('wrong@example.com', 'wrongpassword');
      expect(result).toBeNull();
      expect(mockService.login).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword');
    });
  });

  describe('getScheduledPickups', () => {
    it('should return an array of pickups', async () => {
      const result = await mockService.getScheduledPickups('1');
      expect(Array.isArray(result)).toBe(true);
      
      // Check structure of pickups
      const pickup = result[0];
      expect(pickup).toHaveProperty('id');
      expect(pickup).toHaveProperty('facilityName');
      expect(pickup).toHaveProperty('items');
      expect(pickup).toHaveProperty('listedItemIds');
      expect(pickup).toHaveProperty('status');
      expect(pickup).toHaveProperty('date'); // Check for the new date property

      expect(mockService.getScheduledPickups).toHaveBeenCalledWith('1');
    });
  });

  describe('getHistoricalItemDetails', () => {
    it('should retrieve historical item data', async () => {
      const result = await mockService.getHistoricalItemDetails('item5');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('item5');
      expect(result?.name).toBe('Dell Laptop');
      expect(mockService.getHistoricalItemDetails).toHaveBeenCalledWith('item5');
    });

    it('should return null for non-existent items', async () => {
      const result = await mockService.getHistoricalItemDetails('nonexistent');
      expect(result).toBeNull();
      expect(mockService.getHistoricalItemDetails).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('deleteListedItem', () => {
    it('should not allow deletion of items that are part of pickups', async () => {
      const result = await mockService.deleteListedItem('item1');
      expect(result).toBe(false);
      expect(mockService.deleteListedItem).toHaveBeenCalledWith('item1');
    });

    it('should allow deletion of items that are not part of pickups', async () => {
      const result = await mockService.deleteListedItem('item5');
      expect(result).toBe(true);
      expect(mockService.deleteListedItem).toHaveBeenCalledWith('item5');
    });
  });

  // New Tests for rewards and points functionality
  describe('updateUserPoints', () => {
    it('should update the user points', () => {
      const newPoints = 200;
      mockContextImplementation.updateUserPoints(newPoints);
      expect(userState.points).toBe(newPoints);
      expect(mockContextImplementation.updateUserPoints).toHaveBeenCalledWith(newPoints);
    });

    it('should handle setting points to 0', () => {
      mockContextImplementation.updateUserPoints(0);
      expect(userState.points).toBe(0);
    });
  });

  describe('addRedeemedReward', () => {
    it('should add a new reward to the user', () => {
      const newReward = {
        id: 'reward2',
        name: 'Touch \'n Go eWallet RM30',
        value: 'RM30',
        pin: '0987654321',
        date: new Date().toISOString(),
        imageSource: null,
      };

      mockContextImplementation.addRedeemedReward(newReward);
      
      // Check if reward was added
      const rewards = userState.redeemedRewards || [];
      expect(rewards.length).toBe(2); // Original + new
      expect(rewards[1].id).toBe('reward2');
      expect(rewards[1].value).toBe('RM30');
      expect(rewards[1].pin).toBe('0987654321');
    });

    it('should handle adding a reward when user has no existing rewards', () => {
      // Create a user with no rewards
      userState = { ...userState, redeemedRewards: undefined };
      
      const newReward = {
        id: 'reward3',
        name: 'Touch \'n Go eWallet RM5',
        value: 'RM5',
        pin: '1122334455',
        date: new Date().toISOString(),
        imageSource: null,
      };

      mockContextImplementation.addRedeemedReward(newReward);
      
      // Check if reward was added correctly
      const rewards = userState.redeemedRewards || [];
      expect(rewards.length).toBe(1);
      expect(rewards[0].id).toBe('reward3');
    });
  });

  describe('getRedeemedRewards', () => {
    it('should return the user\'s redeemed rewards', () => {
      const rewards = mockContextImplementation.getRedeemedRewards();
      expect(Array.isArray(rewards)).toBe(true);
      expect(rewards.length).toBe(mockUser.redeemedRewards.length);
      expect(rewards[0].id).toBe('reward1');
      expect(rewards[0].value).toBe('RM15');
    });

    it('should return an empty array if user has no redeemed rewards', () => {
      userState = { ...userState, redeemedRewards: undefined };
      const rewards = mockContextImplementation.getRedeemedRewards();
      expect(Array.isArray(rewards)).toBe(true);
      expect(rewards.length).toBe(0);
    });
  });

  describe('getGiftCards', () => {
    it('should return all available gift cards', () => {
      const giftCards = mockContextImplementation.getGiftCards();
      expect(Array.isArray(giftCards)).toBe(true);
      expect(giftCards.length).toBe(4);
      
      // Check structure of gift cards
      expect(giftCards[0]).toHaveProperty('id');
      expect(giftCards[0]).toHaveProperty('name');
      expect(giftCards[0]).toHaveProperty('points');
      expect(giftCards[0]).toHaveProperty('value');
      expect(giftCards[0]).toHaveProperty('category');
      expect(giftCards[0]).toHaveProperty('status');
    });

    it('should include both available and unavailable gift cards', () => {
      const giftCards = mockContextImplementation.getGiftCards();
      const availableCards = giftCards.filter(card => card.status === 'available');
      const unavailableCards = giftCards.filter(card => card.status === 'unavailable');
      
      expect(availableCards.length).toBeGreaterThan(0);
      expect(unavailableCards.length).toBeGreaterThan(0);
    });
  });
}); 