import React, { useState, useMemo, useEffect } from 'react';
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
import { useItemTypes } from './api/items/itemTypes';
import { useClient } from './api/user/getClient';
import { useAllRewards } from './api/rewards/getRewards';
import { useAllRewardsByType } from './api/rewards/getByRewardsType';
import { Card } from 'react-native-paper';
import { addRewards } from './api/rewards/addUserRewards';
import { updateUserPoints } from './api/user/updatePoint';
import { updateRewardsQuantity } from './api/rewards/updateRewardQuantity';

// Create navigation type definitions similar to other screens
type RootStackParamList = {
  Home: { id:number };
  rewards: { id:number };
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
  const { rewardsT, loadingName } = useItemTypes();
  const { displayClient, loading: loadingClient } = useClient(id); 
  const { user } = useUser();
  const { displayRewards, loading: loadingRewards } = useAllRewards();
  const { fetchRewardsByType, displayAllRewards, loading: loadingAllReward } = useAllRewardsByType();
  
  const [giftCardModalVisible, setGiftCardModalVisible] = useState(false);
  const [selectedGiftCard, setSelectedGiftCard] = useState<GiftCard | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [redemptionPin, setRedemptionPin] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);

  // fetch rewards when category changes
  useEffect(() => {
    if (activeCategory !== null) {
      fetchRewardsByType(activeCategory);
    }
  }, [activeCategory, fetchRewardsByType]);

  //determine which reward to display
  const rewardToDisplay = useMemo(() => {
    return activeCategory === null ? displayRewards : displayAllRewards
  }, [activeCategory, displayRewards, displayAllRewards])

  console.log("Rewards to display:", rewardToDisplay);


  // Filter cards based on active category
  const filteredCards = useMemo(() => {
    if (!rewardToDisplay) return [];

    //create array for available and unavailable 
    const availableCard = rewardToDisplay.filter(card => 
      card.rewards_status === 1 && card.quantity > 0
    ); 

    const unavailableCard = rewardToDisplay.filter(card => 
      card.rewards_status === 2 || card.quantity <= 0
    );

    console.log("Available cards:", availableCard);
    console.log("Unavailable cards:", unavailableCard);

    const sortedAvailable = [...availableCard].sort((a, b) => a.points - b.points);
    const sortedUnavailable = [...unavailableCard].sort((a, b) => a.points - b.points);

    return [...sortedAvailable, ...sortedUnavailable];
  }, [rewardToDisplay]);

  const handleTabPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen, {id: id});
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
    if (!selectedGiftCard || !displayClient) return;
    
    if (displayClient?.reward_points < selectedGiftCard.points) {
      Alert.alert('Insufficient Points', 'You do not have enough points to redeem this gift card.');
      return;
    }

    // Show confirmation dialog before proceeding
    Alert.alert(
      'Confirm Redemption',
      `Are you sure you want to spend ${selectedGiftCard.point_needed} points for a ${selectedGiftCard.rewards_name} ${selectedGiftCard.description}?`,
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
        
            let newPoint = displayClient?.reward_points - selectedGiftCard.point_needed;
            let newQuantity = selectedGiftCard.quantity - 1 ;
            console.log(displayClient?.reward_points)
            console.log(selectedGiftCard.point_needed)
            console.log(newPoint)
            // Update user points and add to redemption history
            if (updateUserPoints && addRewards && updateRewardsQuantity) {
              updateUserPoints(id, newPoint);
              addRewards(id, selectedGiftCard.rewards_id, newPin);
              updateRewardsQuantity(selectedGiftCard.rewards_id, newQuantity);
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
    navigation.replace('rewards', {id: id});
  };

  const imageMap: Record<string, any> = {
    'TnG_Icon.png': require('../screens/assets/TnG_Icon.png'),
  }

  // Generate header text based on card availability sections
  const getRewardsSectionHeader = () => {
    const hasAvailable = filteredCards.some(card => card.rewards_status === 1 && card.quantity > 0);
    const hasUnavailable = filteredCards.some(card => card.rewards_status === 2 || card.quantity <= 0);
  
    if (hasAvailable) {
      return "Available Rewards";
    } else if (hasUnavailable) {
      return "Currently Unavailable";
    } else {
      return "No Rewards Found";
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rewards</Text>
        <View style={styles.pointsContainer}>
          <Icon name="stars" size={20} color="#5E4DCD" />
          <Text style={styles.points}>{displayClient?.reward_points || 0} Points</Text>
        </View>
      </View>

      {/* Reward Categories */}
      <View style={styles.categories}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* "All" button */}
          <TouchableOpacity 
            style={[styles.categoryButton, activeCategory === null ? styles.activeCategoryButton : {}]}
            onPress={() => setActiveCategory(null)}
          >
            <Text style={[styles.categoryText, activeCategory === null ? styles.activeCategoryText : {}]}>All</Text>
          </TouchableOpacity>
          
          {rewardsT.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryButton, activeCategory === category.id ? styles.activeCategoryButton : {}]}
              onPress={() => setActiveCategory(category.id)}
            >
              <Text style={[styles.categoryText, activeCategory === category.id ? styles.activeCategoryText : {}]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Rewards */}
      <ScrollView style={styles.rewardsContainer}>
        {filteredCards.length === 0 ? (
          <Text style={[styles.sectionTitle, { textAlign: 'center', marginTop: 20 }]}>
            Rewards Not Available
          </Text>
        ) : (
          <>
            <Text style={styles.sectionTitle}>{getRewardsSectionHeader()}</Text>
            <View style={styles.rewardsList}>
              {filteredCards.map((card, index) => {
                const isAvailable = card.rewards_status === 1 && card.quantity > 0;
                const isLastAvailable =
                  isAvailable &&
                  filteredCards.findIndex(
                    (c, i) =>
                      i > index &&
                      (c.rewards_status !== 1 || c.quantity <= 0)
                  ) === index + 1;

                return (
                  <React.Fragment key={card.rewards_id}>
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
                          source={imageMap[card.rewards_image]}
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
                              {card.rewards_name}
                            </Text>
                            <Text
                              style={[
                                styles.rewardSubtitle,
                                !isAvailable && styles.unavailableRewardText
                              ]}
                            >
                              {card.description}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.rewardPoints,
                              !isAvailable && styles.unavailableRewardPoints
                            ]}
                          >
                            {card.point_needed} Points
                          </Text>
                          {!isAvailable && (
                            <Text style={styles.unavailableLabel}>
                              temporarily unavailable
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Insert "Unavailable" header if this is the last available card */}
                    {isLastAvailable && (
                      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                        Unavailable
                      </Text>
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </>
        )}
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
                <Text style={styles.modalTitle}>{selectedGiftCard.rewards_name}</Text>
                <Image 
                  source={imageMap[selectedGiftCard.rewards_image ]} 
                  style={styles.modalImage} 
                />
                <Text style={styles.modalDescription}>
                  Redeem your points for a {selectedGiftCard.rewards_name} {selectedGiftCard.description} gift card.
                </Text>
                <View style={styles.pointsRequired}>
                  <Text style={styles.pointsRequiredText}>
                    {selectedGiftCard.point_needed} Points
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.redeemButton, 
                    (!displayClient || displayClient?.reward_points < selectedGiftCard.point_needed) 
                      ? styles.disabledButton : {}
                  ]}
                  onPress={redeemGiftCard}
                  disabled={!displayClient || displayClient?.reward_points < selectedGiftCard.point_needed}
                >
                  <Text style={styles.redeemButtonText}>
                    {(!displayClient || displayClient?.reward_points < selectedGiftCard.point_needed) 
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
                  source={imageMap[selectedGiftCard?.rewards_image ]}
                  style={styles.modalImage} 
                />
                <Text style={styles.modalDescription}>
                  You have redeemed a {selectedGiftCard?.rewards_name} {selectedGiftCard?.description} rewards.
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