import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser, ScheduledPickup } from '../contexts/UserContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute } from '@react-navigation/native';
import { grabTransactionOrg } from './api/transaction/grabTransactionOrg';
import { useOrganization } from './api/transaction/getOrganization';
import { grabHistory } from './api/transaction/grabHistory';
import { useItemTypes } from './api/items/itemTypes';

type RootStackParamList = {
  Home: {id: number};
  CProfileScreen: {id: number};
  PickupHistory: { id:number };
  PickupDetails: { id:number, orgId: number };
  rewards: { id:number };
  notifications: { id:number };
  PickupHistoryDetails: { id:number, orgId: number};
};

type PickupHistoryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PickupHistory'>;
};

const PickupHistoryScreen: React.FC<PickupHistoryScreenProps> = ({ navigation }) => {
  const route = useRoute();
  const {id} = route.params;
  const { displayHistory, loading: loadingHistory} = grabHistory(id);
  const { displayOrg, loading: loadingOrg} = useOrganization();
  const { getScheduledPickups } = useUser();
  const { pickupStatus, loadingName } = useItemTypes();
  const [pickups, setPickups] = useState<ScheduledPickup[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   loadPickups();
  // }, []);

  // const loadPickups = async () => {
  //   setLoading(true);
  //   try {
  //     const allPickups = await getScheduledPickups();
  //     // Filter to only show completed or cancelled pickups
  //     const historyPickups = allPickups.filter(
  //       pickup => pickup.status === 'completed' || pickup.status === 'cancelled'
  //     );
      
  //     // Sort pickups by date (most recent first)
  //     const sortedPickups = [...historyPickups].sort((a, b) => 
  //       new Date(b.date).getTime() - new Date(a.date).getTime()
  //     );
      
  //     setPickups(sortedPickups);
  //   } catch (error) {
  //     console.error('Failed to load pickup history:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleViewPickup = (orgId: number) => {
    navigation.navigate('PickupHistoryDetails', { id, orgId });
  };

  const getStatusColor = (status: number) => {
    if (status === 3) return '#4CAF50'; // Green for completed
    if (status === 4) return '#F44336'; // Red for cancelled
    return '#FFC107'; // Default yellow
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTabPress = (screen: keyof RootStackParamList) => {
    if (screen === 'Home' || screen === 'CProfileScreen' || 
        screen === 'PickupHistory' || screen === 'rewards' || 
        screen === 'notifications') {
      navigation.navigate(screen, {id:id});
    } else if (screen === 'PickupDetails') {
      console.log('Cannot navigate directly to PickupDetails without pickupId');
    }
  };
  

  const renderPickupItem = ({item}) => {
    const organization = displayOrg.find((org) => org.organizationID === item.organization_id);
    const status = pickupStatus.find((t) => t.id === item.pickup_status_id)
    const formattedDate = item?.updateDate 
    ? new Date(item.updateDate).toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) 
    : 'Unknown Date';    
    const itemCount = item.items ? item.items.length : 1;

    return(
      <TouchableOpacity 
        key={item.id} 
        style={styles.pickupCard}
        onPress={() => handleViewPickup(item.organization_id)}
      >
        <View style={styles.pickupContent}>
          <Text style={styles.facilityName}>{organization?.organization_name}</Text>
        <View style={styles.pickupDetails}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.pickup_status_id) }]}>
          <Text style={styles.statusText}>{status?.name}</Text>
        </View>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
          <Text style={styles.itemCountText}>
            {itemCount}
          </Text>
        </View>
            
        <Icon name="visibility" size={24} color="#5E4DCD" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Pickup History</Text>
      </View>

      {/* Pickup List */}
      {displayHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="history" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>No pickup history found</Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Home', {id: id})}
          >
            <Text style={styles.exploreButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayHistory}
          renderItem={renderPickupItem}
          keyExtractor={item => item.id}          
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress('Home')}>
          <Icon name="home" size={24} color="#666" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress('rewards')}>
          <Icon name="star" size={24} color="#666" />
          <Text style={styles.navText}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress('notifications')}>
          <Icon name="notifications" size={24} color="#666" />
          <Text style={styles.navText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress('CProfileScreen')}>
          <Icon name="person" size={24} color="#5E4DCD" />
          <Text style={[styles.navText, styles.activeNavText]}>Profile</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
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
  pickupCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  pickupContent: {
    flex: 1,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  pickupDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  itemCountText: {
    fontSize: 14,
    color: '#666',
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
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
});

export default PickupHistoryScreen; 