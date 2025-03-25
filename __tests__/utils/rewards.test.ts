import { GiftCard } from '../../contexts/UserContext';

// Utility function to generate a random PIN (extracted from RewardsScreen)
const generatePin = (): string => {
  let pin = '';
  for (let i = 0; i < 10; i++) {
    pin += Math.floor(Math.random() * 10).toString();
  }
  return pin;
};

// Utility function to filter and sort gift cards
const filterAndSortGiftCards = (
  cards: GiftCard[], 
  category: string = 'All'
): GiftCard[] => {
  // First filter by category if needed
  const filteredByCategory = category === 'All' 
    ? cards 
    : cards.filter(card => card.category === category);
  
  // Then sort by availability (available first) and then by point cost
  return [...filteredByCategory].sort((a, b) => {
    // First sort by availability
    if (a.status === 'available' && b.status === 'unavailable') return -1;
    if (a.status === 'unavailable' && b.status === 'available') return 1;
    // Then sort by points
    return a.points - b.points;
  });
};

// Sample gift card data for testing
const mockGiftCards: GiftCard[] = [
  { id: '1', name: 'Touch \'n Go eWallet RM5', points: 50, image: null, value: 'RM5', category: 'Gift Cards', status: 'available' },
  { id: '2', name: 'Touch \'n Go eWallet RM15', points: 150, image: null, value: 'RM15', category: 'Gift Cards', status: 'available' },
  { id: '3', name: 'Touch \'n Go eWallet RM30', points: 300, image: null, value: 'RM30', category: 'Gift Cards', status: 'available' },
  { id: '4', name: 'Touch \'n Go eWallet RM50', points: 500, image: null, value: 'RM50', category: 'Gift Cards', status: 'unavailable' },
  { id: '5', name: 'Touch \'n Go eWallet RM100', points: 1000, image: null, value: 'RM100', category: 'Gift Cards', status: 'unavailable' },
  { id: '6', name: 'Store Discount 10%', points: 100, image: null, value: '10%', category: 'Discounts', status: 'available' },
  { id: '7', name: 'Store Discount 25%', points: 250, image: null, value: '25%', category: 'Discounts', status: 'unavailable' },
];

describe('Rewards Utilities', () => {
  describe('generatePin', () => {
    it('should generate a 10-digit PIN', () => {
      const pin = generatePin();
      expect(pin.length).toBe(10);
      expect(/^\d{10}$/.test(pin)).toBe(true); // Only digits
    });
    
    it('should generate different PINs on each call', () => {
      const pin1 = generatePin();
      const pin2 = generatePin();
      expect(pin1).not.toBe(pin2);
    });
  });
  
  describe('filterAndSortGiftCards', () => {
    it('should return all gift cards when category is All', () => {
      const result = filterAndSortGiftCards(mockGiftCards);
      expect(result.length).toBe(mockGiftCards.length);
    });
    
    it('should filter gift cards by category', () => {
      const result = filterAndSortGiftCards(mockGiftCards, 'Gift Cards');
      expect(result.length).toBe(5);
      expect(result.every(card => card.category === 'Gift Cards')).toBe(true);
      
      const discounts = filterAndSortGiftCards(mockGiftCards, 'Discounts');
      expect(discounts.length).toBe(2);
      expect(discounts.every(card => card.category === 'Discounts')).toBe(true);
    });
    
    it('should sort available cards before unavailable cards', () => {
      const result = filterAndSortGiftCards(mockGiftCards);
      
      // Get indexes of available and unavailable cards
      const availableIndexes = result
        .map((card, index) => card.status === 'available' ? index : -1)
        .filter(index => index !== -1);
      
      const unavailableIndexes = result
        .map((card, index) => card.status === 'unavailable' ? index : -1)
        .filter(index => index !== -1);
      
      // Check that all available cards come before unavailable cards
      const maxAvailableIndex = Math.max(...availableIndexes);
      const minUnavailableIndex = Math.min(...unavailableIndexes);
      
      expect(maxAvailableIndex).toBeLessThan(minUnavailableIndex);
    });
    
    it('should sort cards by points within availability groups', () => {
      const result = filterAndSortGiftCards(mockGiftCards);
      
      // Get available and unavailable cards separately
      const availableCards = result.filter(card => card.status === 'available');
      const unavailableCards = result.filter(card => card.status === 'unavailable');
      
      // Check sorting within available cards
      for (let i = 0; i < availableCards.length - 1; i++) {
        expect(availableCards[i].points).toBeLessThanOrEqual(availableCards[i+1].points);
      }
      
      // Check sorting within unavailable cards
      for (let i = 0; i < unavailableCards.length - 1; i++) {
        expect(unavailableCards[i].points).toBeLessThanOrEqual(unavailableCards[i+1].points);
      }
    });
    
    it('should return a new array without modifying the original', () => {
      const original = [...mockGiftCards];
      const result = filterAndSortGiftCards(mockGiftCards);
      
      // Check the original wasn't modified
      expect(mockGiftCards).toEqual(original);
      
      // Check the result is a different array instance
      expect(result).not.toBe(mockGiftCards);
    });
  });
}); 