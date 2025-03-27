import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated, Easing, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser, DevAutoLogin, ScheduledPickup, type ListedItem } from '../contexts/UserContext';
import { useFocusEffect } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  PickupDetails: { pickupId: string };
  AddPickupItem: undefined;
  EditListedItems: { itemId: string };
  CProfileScreen: undefined;
  rewards: undefined;
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

// Define types for our data
interface PickupItem {
  id: number;
  facility: string;
}

const LoadingIcon: React.FC = () => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startRotation = () => {
      spinValue.setValue(0);
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    startRotation();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Icon name="sync" size={24} color="#666" />
    </Animated.View>
  );
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, getScheduledPickups, getListedItems, deleteListedItem } = useUser();
  const [scheduledPickups, setScheduledPickups] = useState<ScheduledPickup[]>([]);
  const [listedItems, setListedItems] = useState<ListedItem[]>([]);
  const [isPickupsLoading, setIsPickupsLoading] = useState(true);
  const [isItemsLoading, setIsItemsLoading] = useState(true);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    if (user) {
      // Load pickups
      setIsPickupsLoading(true);
      const allPickups = await getScheduledPickups();
      // Filter to show only ongoing pickups
      const ongoingPickups = allPickups.filter(pickup => pickup.status === 'ongoing');
      setScheduledPickups(ongoingPickups);
      setIsPickupsLoading(false);

      // Load listed items
      setIsItemsLoading(true);
      const items = await getListedItems();
      setListedItems(items);
      setIsItemsLoading(false);
    }
  };

  // Helper function to check if an item is in any scheduled pickup
  const isItemInPickup = (itemId: string) => {
    return scheduledPickups.some(pickup => pickup.listedItemIds.includes(itemId));
  };

  const handleViewPickup = (pickupId: string) => {
    navigation.navigate('PickupDetails', { pickupId });
  };

  const handleEditPickup = (pickupId: string) => {
    // Show options to update pickup status
    Alert.alert(
      "Update Pickup",
      "What would you like to do with this pickup?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Mark as Completed",
          onPress: async () => {
            // In a real app, this would call an API to update the pickup
            Alert.alert(
              "Success", 
              "Pickup has been marked as completed. You can view it in your Pickup History."
            );
            
            // Trigger data reload to reflect the changes
            loadData();
          }
        },
        {
          text: "Mark as Cancelled",
          style: "destructive",
          onPress: async () => {
            // In a real app, this would call an API to update the pickup
            Alert.alert(
              "Success", 
              "Pickup has been cancelled. You can view it in your Pickup History."
            );
            
            // Trigger data reload to reflect the changes
            loadData();
          }
        }
      ]
    );
  };

  const handleEditItem = (itemId: string) => {
    navigation.navigate('EditListedItems', { itemId });
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    Alert.alert(
      "Remove Item",
      `Are you sure you want to remove "${itemName}" from listing?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            const success = await deleteListedItem(itemId);
            if (success) {
              // Refresh the list after deletion
              loadData();
            } else {
              Alert.alert(
                "Error",
                "Unable to remove this item. It might be part of a scheduled pickup."
              );
            }
          }
        }
      ]
    );
  };

  const handleAddPickupItem = () => {
    navigation.navigate('AddPickupItem');
  };

  const handleTabPress = (tabName: string) => {
    console.log('Pressed tab:', tabName);
    if (tabName === 'profile') {
      navigation.navigate('CProfileScreen');
    } else if (tabName === 'rewards') {
      navigation.navigate('rewards');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <DevAutoLogin />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>E-Waste App</Text>
        <View style={styles.pointsContainer}>
          <Icon name="stars" size={20} color="#5E4DCD" />
          <Text style={styles.points}>Points {user?.points || 0}</Text>
        </View>
      </View>

      {/* Scheduled Pickups Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Scheduled Pickups</Text>
        <View style={styles.tableContainer}>
          <ScrollView style={styles.scrollView}>
            {isPickupsLoading ? (
              <View style={styles.loadingContainer}>
                <LoadingIcon />
              </View>
            ) : scheduledPickups.map((pickup) => (
              <View key={pickup.id} style={styles.tableRow}>
                <Text style={styles.facilityText}>{pickup.facilityName}</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.iconButton} 
                    onPress={() => handleViewPickup(pickup.id)}
                  >
                    <Icon name="visibility" size={24} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.iconButton} 
                    onPress={() => handleEditPickup(pickup.id)}
                  >
                    <LoadingIcon />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Listed Items Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Listed Items</Text>
        <View style={styles.tableContainer}>
          <ScrollView style={styles.scrollView}>
            {isItemsLoading ? (
              <View style={styles.loadingContainer}>
                <LoadingIcon />
              </View>
            ) : listedItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No items listed yet</Text>
              </View>
            ) : (
              [...listedItems]
                .sort((a, b) => {
                  const aInPickup = isItemInPickup(a.id);
                  const bInPickup = isItemInPickup(b.id);
                  if (aInPickup === bInPickup) return 0;
                  return aInPickup ? 1 : -1; // Items not in pickup (Listing) come first
                })
                .map((item) => {
                  const inPickup = isItemInPickup(item.id);
                  return (
                    <View key={item.id} style={styles.tableRow}>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemText}>{item.name}</Text>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemSubtext}>
                            {item.type} • {item.condition}
                          </Text>
                          {inPickup ? (
                            <Text style={styles.itemStatus}>
                              Awaiting Pickup
                            </Text>
                          ) : (
                            <Text style={styles.listingStatus}>
                              Listing
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity 
                          style={styles.iconButton} 
                          onPress={() => handleEditItem(item.id)}
                          disabled={inPickup}
                        >
                          <Icon 
                            name="edit" 
                            size={24} 
                            color={inPickup ? "#BDBDBD" : "#666"} 
                          />
                        </TouchableOpacity>
                        
                        {!inPickup && (
                          <TouchableOpacity 
                            style={styles.deleteButton} 
                            onPress={() => handleDeleteItem(item.id, item.name)}
                          >
                            <Icon 
                              name="close" 
                              size={24} 
                              color="#D32F2F" 
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })
            )}
          </ScrollView>
        </View>
      </View>

      {/* Add Pickup Item Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddPickupItem}
      >
        <Text style={styles.addButtonText}>Add Pickup Item</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleTabPress('home')}
        >
          <Icon name="home" size={24} color="#5E4DCD" />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleTabPress('rewards')}
        >
          <Icon name="star" size={24} color="#666" />
          <Text style={styles.navText}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleTabPress('notifications')}
        >
          <Icon name="notifications" size={24} color="#666" />
          <Text style={styles.navText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleTabPress('profile')}
        >
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
    marginBottom: 8,
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
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  tableContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    overflow: 'hidden',
    height: 200, // Fixed height for the container
  },
  scrollView: {
    flexGrow: 0, // Prevents ScrollView from expanding
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  facilityText: {
    fontSize: 16,
    color: '#333',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
  },
  addButton: {
    backgroundColor: '#5E4DCD',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: 'center',
    marginBottom: 24,
  },
  addButtonText: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  itemDetails: {
    flexDirection: 'column',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemSubtext: {
    color: '#666',
    fontSize: 12,
  },
  itemStatus: {
    fontSize: 12,
    color: '#5E4DCD',
    fontWeight: '500',
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listingStatus: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '500',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default HomeScreen; 