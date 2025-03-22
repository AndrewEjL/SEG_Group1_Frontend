import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser, ScheduledPickup } from '../contexts/UserContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  CProfileScreen: undefined;
  PickupHistory: undefined;
  PickupDetails: { pickupId: string };
};

type PickupHistoryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PickupHistory'>;
};

const PickupHistoryScreen: React.FC<PickupHistoryScreenProps> = ({ navigation }) => {
  const { getScheduledPickups } = useUser();
  const [pickups, setPickups] = useState<ScheduledPickup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPickups();
  }, []);

  const loadPickups = async () => {
    setLoading(true);
    try {
      const allPickups = await getScheduledPickups();
      // Filter to only show completed or cancelled pickups
      const historyPickups = allPickups.filter(
        pickup => pickup.status === 'completed' || pickup.status === 'cancelled'
      );
      setPickups(historyPickups);
    } catch (error) {
      console.error('Failed to load pickup history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPickup = (pickupId: string) => {
    navigation.navigate('PickupDetails', { pickupId });
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return '#4CAF50'; // Green for completed
    if (status === 'cancelled') return '#F44336'; // Red for cancelled
    return '#FFC107'; // Default yellow
  };

  const handleTabPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Pick up History</Text>
      </View>

      {/* Pickup List */}
      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : pickups.length === 0 ? (
          <Text style={styles.emptyText}>No pickup history found</Text>
        ) : (
          pickups.map((pickup) => (
            <TouchableOpacity 
              key={pickup.id} 
              style={styles.pickupCard}
              onPress={() => handleViewPickup(pickup.id)}
            >
              <View style={styles.pickupContent}>
                <Text style={styles.facilityName}>{pickup.facilityName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pickup.status) }]}>
                  <Text style={styles.statusText}>{pickup.status}</Text>
                </View>
              </View>
              
              <Icon name="visibility" size={24} color="#5E4DCD" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress('Home')}>
          <Icon name="home" size={24} color="#666" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress('Home')}>
          <Icon name="star" size={24} color="#666" />
          <Text style={styles.navText}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress('Home')}>
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
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  pickupCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
  },
  pickupContent: {
    flex: 1,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
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