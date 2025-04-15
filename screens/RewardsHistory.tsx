import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser } from '../contexts/UserContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute } from '@react-navigation/native';
import { useAllUserRewards } from './api/rewards/getUserRewards';
import { useAllRewards } from './api/rewards/getRewards';
import { useItemTypes } from './api/items/itemTypes';

// Define navigation types
type RootStackParamList = {
  Home: { id:number };
  rewards: { id:number };
  profile: { id:number };
  CProfileScreen: { id:number };
  RewardsHistory: { id:number };
};

// Define redemption type
type RewardRedemption = {
  id: number;
  rewards_id: number;
  rewards_name: string;
  description: string;
  rewards_pin: string;
  created_date: string;
  rewards_image: string;
  rewards_type: number;
};

type RewardsHistoryProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RewardsHistory'>;
};

const RewardsHistory: React.FC<RewardsHistoryProps> = ({ navigation }) => {
  const route = useRoute();
  const {id} = route.params;
  const { user } = useUser();
  const { displayUserRewards, loading: loadingAllUserRewards } = useAllUserRewards(id);
  console.log(displayUserRewards)
  const { displayRewards, loading: loadingAllReward } = useAllRewards();
  const { rewardsT, loadingName } = useItemTypes();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RewardRedemption | null>(null);
  const [sortedRewards, setSortedRewards] = useState<RewardRedemption[]>([]);
  const [mergedRewards, setMergedRewards] = useState<RewardRedemption[]>([]);

  // Get TnG icon for all rewards
  const imageMap: Record<string, any> = {
    'TnG_Icon.png': require('../screens/assets/TnG_Icon.png'),
  }

  useEffect(() => {
    if (displayUserRewards && displayRewards) {
      const merge = displayUserRewards.map(userReward => {
        const rewardDetails = displayRewards.find(
          reward => reward.rewards_id === userReward.rewards_id
        );

        const rewardTypeName = rewardsT.find((t) => t.id === rewardDetails?.rewards_type)?.name;

        return {
          id: userReward.id,
          rewards_id: userReward.rewards_id,
          rewards_name: rewardDetails?.rewards_name,
          description: rewardDetails?.description,
          rewards_pin: userReward.rewards_pin,
          created_date: userReward.createdDate,
          rewards_image: rewardDetails?.rewards_image,
          imageSource: imageMap[rewardDetails?.rewards_image],
          rewards_type: rewardTypeName
        };
      });
      
      merge.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
      setSortedRewards(merge);
    }
  }, [displayUserRewards, displayRewards]);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kuala_Lumpur',
      hour12: true
    }).format(new Date(dateString));
  };

  const openRewardDetails = (item: RewardRedemption) => {
    setSelectedReward(item);
    setModalVisible(true);
  };

  const renderRewardItem = ({ item }: { item: RewardRedemption }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => openRewardDetails(item)}
    >
      <Image source={imageMap[item.rewards_image]} style={styles.rewardImage} />
      <View style={styles.rewardInfo}>
        <Text style={styles.rewardName}>{item.rewards_name}</Text>
        <Text style={styles.rewardDescription}>{item.description}</Text>
        <Text style={styles.rewardDate}>{formatDate(item.created_date)}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Rewards History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* History List */}
      {displayUserRewards.length > 0 ? (
        <FlatList
          data={sortedRewards}
          renderItem={renderRewardItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="history" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>No redeemed rewards yet</Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => navigation.navigate('rewards', {id: id})}
          >
            <Text style={styles.exploreButtonText}>Explore Rewards</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reward Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            
            {selectedReward && (
              <>
                <Text style={styles.modalTitle}>Reward Details</Text>
                <Image 
                  source={ imageMap[selectedReward.rewards_image] } 
                  style={styles.modalImage} 
                />
                <Text style={styles.modalValue}>{selectedReward.rewards_name}</Text>
                <Text style={styles.modalDescription}>
                  {selectedReward.description} {selectedReward.rewards_type}
                </Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Redeemed:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedReward.created_date)}</Text>
                </View>
                <View style={styles.pinContainer}>
                  <Text style={styles.pinLabel}>Redemption PIN:</Text>
                  <Text style={styles.pinValue}>{selectedReward.rewards_pin}</Text>
                </View>
                <Text style={styles.pinInstructions}>
                  Use this PIN to redeem your {selectedReward.rewards_type}in the {selectedReward.description} app.
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  rewardImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 16,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  rewardDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#5E4DCD',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
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
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 20,
  },
  modalImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  modalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 8,
  },
  detailLabel: {
    width: '40%',
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  pinContainer: {
    backgroundColor: '#F0EBF8',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginVertical: 20,
    width: '100%',
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
  },
  pinInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default RewardsHistory; 