import React, { useState } from 'react';
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

// Create navigation type definitions similar to other screens
type RootStackParamList = {
  Home: undefined;
  rewards: undefined;
  notifications: undefined;
  profile: undefined;
  CProfileScreen: undefined;
};

type RewardsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'rewards'>;
};

const RewardsScreen: React.FC<RewardsScreenProps> = ({ navigation }) => {
  const { user } = useUser();
  const [giftCardModalVisible, setGiftCardModalVisible] = useState(false);
  const [selectedGiftCard, setSelectedGiftCard] = useState<null | { name: string, points: number, value: string }>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  // Gift card data
  const giftCards = [
    { id: '1', name: 'Touch \'n Go eWallet RM5', points: 50, image: require('./assets/TnG_Icon.png'), value: 'RM5', category: 'Gift Cards' },
    { id: '2', name: 'Touch \'n Go eWallet RM15', points: 150, image: require('./assets/TnG_Icon.png'), value: 'RM15', category: 'Gift Cards' },
    { id: '3', name: 'Touch \'n Go eWallet RM30', points: 300, image: require('./assets/TnG_Icon.png'), value: 'RM30', category: 'Gift Cards' },
    { id: '4', name: 'Touch \'n Go eWallet RM50', points: 500, image: require('./assets/TnG_Icon.png'), value: 'RM50', category: 'Gift Cards' },
    { id: '5', name: 'Touch \'n Go eWallet RM100', points: 1000, image: require('./assets/TnG_Icon.png'), value: 'RM100', category: 'Gift Cards' },
    // We can add more gift cards later as needed
  ];

  // Filter cards based on active category
  const filteredCards = activeCategory === 'All' 
    ? giftCards 
    : giftCards.filter(card => card.category === activeCategory);

  // Sort cards by point cost
  const sortedCards = [...filteredCards].sort((a, b) => a.points - b.points);

  const handleTabPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  const openGiftCardDetails = (giftCard: { name: string, points: number, value: string }) => {
    setSelectedGiftCard(giftCard);
    setGiftCardModalVisible(true);
  };

  const redeemGiftCard = () => {
    if (!selectedGiftCard) return;
    
    if (!user || user.points < selectedGiftCard.points) {
      Alert.alert('Insufficient Points', 'You do not have enough points to redeem this gift card.');
      return;
    }

    // In real app, we would call the updatePoints function from UserContext
    Alert.alert('Success', `Congratulations! You have redeemed a ${selectedGiftCard.value} Touch 'n Go eWallet gift card.`);
    setGiftCardModalVisible(false);
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

      {/* Available Rewards */}
      <ScrollView style={styles.rewardsContainer}>
        <Text style={styles.sectionTitle}>Available Rewards</Text>
        <View style={styles.rewardsList}>
          {sortedCards.map((card) => (
            <TouchableOpacity 
              key={card.id} 
              style={styles.rewardCard}
              onPress={() => openGiftCardDetails(card)}
            >
              <View style={styles.rewardCardContent}>
                <Image source={card.image} style={styles.rewardImage} />
                <View style={styles.rewardInfo}>
                  <View style={styles.rewardNameContainer}>
                    <Text style={styles.rewardName}>{card.value}</Text>
                    <Text style={styles.rewardSubtitle}>Touch 'n Go eWallet</Text>
                  </View>
                  <Text style={styles.rewardPoints}>{card.points} Points</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Gift Card Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={giftCardModalVisible}
        onRequestClose={() => setGiftCardModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setGiftCardModalVisible(false)}
            >
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            
            {selectedGiftCard && (
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  rewardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  rewardPoints: {
    fontSize: 14,
    color: '#5E4DCD',
    fontWeight: '500',
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
});

export default RewardsScreen; 