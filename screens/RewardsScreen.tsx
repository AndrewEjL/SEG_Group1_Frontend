import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser } from '../contexts/UserContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GiftCard } from '../contexts/UserContext';
import { useRoute } from '@react-navigation/native';

// Create navigation type definitions similar to other screens
type RootStackParamList = {
  Home: { id:number };
  rewards: { id:number };
  notifications: { id:number };
  profile: { id:number };
  CProfileScreen: { id:number };
  RewardsHistory: { id:number };
};

type RewardsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'rewards'>;
};

const RewardsScreen: React.FC<RewardsScreenProps> = ({ navigation }) => {
  const route = useRoute();
  const {id} = route.params;
  console.log(id)
  const { user, updateUserPoints, addRedeemedReward, getGiftCards } = useUser();
  const [giftCardModalVisible, setGiftCardModalVisible] = useState(false);
  const [selectedGiftCard, setSelectedGiftCard] = useState<GiftCard | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [redemptionPin, setRedemptionPin] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);

  // Get gift card data from UserContext
  const giftCards = getGiftCards();

  // Filter cards based on active category
  const filteredCards = useMemo(() => {
    const categoryFiltered = activeCategory === 'All' 
      ? giftCards 
      : giftCards.filter(card => card.category === activeCategory);
    
    // Sort by availability (available first) and then by point cost
    return [...categoryFiltered].sort((a, b) => {
      // First sort by availability
      if (a.status === 'available' && b.status === 'unavailable') return -1;
      if (a.status === 'unavailable' && b.status === 'available') return 1;
      // Then sort by points
      return a.points - b.points;
    });
  }, [giftCards, activeCategory]);

  const handleTabPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen, id);
  };

  const openGiftCardDetails = (giftCard: GiftCard) => {
    setSelectedGiftCard(giftCard);
    setGiftCardModalVisible(true);
    setShowPin(false);
  };

  // Generate a random 10-digit PIN
  const generatePin = (): string => {
    let pin = '';
    for (let i = 0; i < 10; i++) {
      pin += Math.floor(Math.random() * 10).toString();
    }
    return pin;
  };

  const redeemGiftCard = () => {
    if (!selectedGiftCard || !user) return;
    
    if (user.points < selectedGiftCard.points) {
      Alert.alert('Insufficient Points', 'You do not have enough points to redeem this gift card.');
      return;
    }

    // Show confirmation dialog before proceeding
    Alert.alert(
      'Confirm Redemption',
      `Are you sure you want to redeem ${selectedGiftCard.points} points for a ${selectedGiftCard.value} Touch 'n Go eWallet gift card?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Redeem',
          onPress: () => {
            // Generate a new PIN for this redemption
            const newPin = generatePin();
            setRedemptionPin(newPin);
            setShowPin(true);
        
            // Create a reward redemption record with current timestamp
            const rewardRedemption = {
              id: Date.now().toString(),
              name: selectedGiftCard.name,
              value: selectedGiftCard.value,
              pin: newPin,
              date: new Date().toISOString(),
              imageSource: selectedGiftCard.image,
            };
        
            // Update user points and add to redemption history
            if (updateUserPoints && addRedeemedReward) {
              updateUserPoints(user.points - selectedGiftCard.points);
              addRedeemedReward(rewardRedemption);
            }
          }
        }
      ]
    );

    // Don't close modal yet, we'll show the PIN
  };

  const closeRedemptionModal = () => {
    setGiftCardModalVisible(false);
    setRedemptionPin(null);
    setShowPin(false);
  };

  // Generate header text based on card availability sections
  const getRewardsSectionHeader = () => {
    const hasAvailable = filteredCards.some(card => card.status === 'available');
    const hasUnavailable = filteredCards.some(card => card.status === 'unavailable');
    
    if (hasAvailable && hasUnavailable) {
      return "Available Rewards";
    }
    return "Unavailable";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rewards</Text>
        <View style={styles.pointsContainer}>
          <Icon name="stars" size={20} color="#5E4DCD" />
          <Text style={styles.points}>{user?.points || 0} Points</Text>
        </View>
      </View>

      {/* Reward Categories */}
      <View style={styles.categories}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.categoryButton, activeCategory === 'All' ? styles.activeCategoryButton : {}]}
            onPress={() => setActiveCategory('All')}
          >
            <Text style={[styles.categoryText, activeCategory === 'All' ? styles.activeCategoryText : {}]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryButton, activeCategory === 'Gift Cards' ? styles.activeCategoryButton : {}]}
            onPress={() => setActiveCategory('Gift Cards')}
          >
            <Text style={[styles.categoryText, activeCategory === 'Gift Cards' ? styles.activeCategoryText : {}]}>Gift Cards</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryButton, activeCategory === 'Vouchers' ? styles.activeCategoryButton : {}]}
            onPress={() => setActiveCategory('Vouchers')}
          >
            <Text style={[styles.categoryText, activeCategory === 'Vouchers' ? styles.activeCategoryText : {}]}>Vouchers</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryButton, activeCategory === 'Discounts' ? styles.activeCategoryButton : {}]}
            onPress={() => setActiveCategory('Discounts')}
          >
            <Text style={[styles.categoryText, activeCategory === 'Discounts' ? styles.activeCategoryText : {}]}>Discounts</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Rewards */}
      <ScrollView style={styles.rewardsContainer}>
        <Text style={styles.sectionTitle}>{getRewardsSectionHeader()}</Text>
        <View style={styles.rewardsList}>
          {filteredCards.map((card) => {
            const isAvailable = card.status === 'available';
            const lastAvailableCard = isAvailable && 
              filteredCards.findIndex((c, index) => index > filteredCards.indexOf(card) && c.status === 'unavailable') === filteredCards.indexOf(card) + 1;
            
            return (
              <React.Fragment key={card.id}>
                <TouchableOpacity 
                  style={[
                    styles.rewardCard,
                    !isAvailable && styles.unavailableRewardCard
                  ]}
                  onPress={() => isAvailable && openGiftCardDetails(card)}
                  disabled={!isAvailable}
                >
                  <View style={styles.rewardCardContent}>
                    <Image 
                      source={card.image} 
                      style={[
                        styles.rewardImage,
                        !isAvailable && styles.unavailableRewardImage
                      ]} 
                    />
                    <View style={styles.rewardInfo}>
                      <View style={styles.rewardNameContainer}>
                        <Text 
                          style={[
                            styles.rewardName,
                            !isAvailable && styles.unavailableRewardText
                          ]}
                        >
                          {card.value}
                        </Text>
                        <Text 
                          style={[
                            styles.rewardSubtitle,
                            !isAvailable && styles.unavailableRewardText
                          ]}
                        >
                          Touch 'n Go eWallet
                        </Text>
                      </View>
                      <Text 
                        style={[
                          styles.rewardPoints,
                          !isAvailable && styles.unavailableRewardPoints
                        ]}
                      >
                        {card.points} Points
                      </Text>
                      {!isAvailable && (
                        <Text style={styles.unavailableLabel}>temporarily unavailable</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                
                {/* Add a section header if this is the last available card */}
                {lastAvailableCard && (
                  <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Unavailable</Text>
                )}
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>

      {/* Gift Card Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={giftCardModalVisible}
        onRequestClose={closeRedemptionModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeRedemptionModal}
            >
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            
            {selectedGiftCard && !showPin && (
              <>
                <Text style={styles.modalTitle}>{selectedGiftCard.name}</Text>
                <Image 
                  source={selectedGiftCard.image} 
                  style={styles.modalImage} 
                />
                <Text style={styles.modalDescription}>
                  Redeem your points for a {selectedGiftCard.value} Touch 'n Go eWallet gift card.
                </Text>
                <View style={styles.pointsRequired}>
                  <Text style={styles.pointsRequiredText}>
                    {selectedGiftCard.points} Points
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.redeemButton, 
                    (!user || user.points < selectedGiftCard.points) 
                      ? styles.disabledButton : {}
                  ]}
                  onPress={redeemGiftCard}
                  disabled={!user || user.points < selectedGiftCard.points}
                >
                  <Text style={styles.redeemButtonText}>
                    {(!user || user.points < selectedGiftCard.points) 
                      ? 'Not Enough Points' 
                      : 'Redeem Now'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {showPin && redemptionPin && (
              <>
                <Text style={styles.modalTitle}>Redemption Successful!</Text>
                <Image 
                  source={selectedGiftCard?.image}
                  style={styles.modalImage} 
                />
                <Text style={styles.modalDescription}>
                  You have redeemed a {selectedGiftCard?.value} Touch 'n Go eWallet gift card.
                </Text>
                <View style={styles.pinContainer}>
                  <Text style={styles.pinLabel}>Your PIN Code:</Text>
                  <Text style={styles.pinValue}>{redemptionPin}</Text>
                  <Text style={styles.pinInstructions}>
                    Use this PIN to redeem your gift card in the Touch 'n Go eWallet app.
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.redeemButton}
                  onPress={closeRedemptionModal}
                >
                  <Text style={styles.redeemButtonText}>Done</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("Home")}>
          <Icon name="home" size={24} color="#666" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("rewards")}>
          <Icon name="star" size={24} color="#5E4DCD" />
          <Text style={[styles.navText, styles.activeNavText]}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("notifications")}>
          <Icon name="notifications" size={24} color="#666" />
          <Text style={styles.navText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("CProfileScreen")}>
          <Icon name="person" size={24} color="#666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  points: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
    color: '#333',
  },
  categories: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  activeCategoryButton: {
    backgroundColor: '#5E4DCD',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  rewardsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  rewardsList: {
    marginBottom: 80, // Ensure space for bottom navigation
  },
  rewardCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  unavailableRewardCard: {
    backgroundColor: '#F2F2F2',
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  rewardCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  unavailableRewardImage: {
    opacity: 0.5,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardNameContainer: {
    marginBottom: 4,
  },
  rewardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  unavailableRewardText: {
    color: '#999',
  },
  rewardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  rewardPoints: {
    fontSize: 14,
    color: '#5E4DCD',
    fontWeight: '500',
  },
  unavailableRewardPoints: {
    color: '#999',
  },
  unavailableLabel: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeNavText: {
    color: '#5E4DCD',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 20,
  },
  modalImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  pointsRequired: {
    backgroundColor: '#F0EBF8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 20,
  },
  pointsRequiredText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5E4DCD',
  },
  redeemButton: {
    backgroundColor: '#5E4DCD',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    width: '80%',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  redeemButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  pinContainer: {
    backgroundColor: '#F0EBF8',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    width: '90%',
    alignItems: 'center',
  },
  pinLabel: {
    fontSize: 14,
    color: '#5E4DCD',
    marginBottom: 8,
  },
  pinValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5E4DCD',
    letterSpacing: 2,
    marginBottom: 12,
  },
  pinInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default RewardsScreen; 