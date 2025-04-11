import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated, Easing, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser, ScheduledPickup, type ListedItem } from '../contexts/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const COMPLETED_PICKUPS_STORAGE_KEY = 'completedPickupIds';

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
  const { user, getScheduledPickups, getListedItems, deleteListedItem, getOrganizationName, updatePickup, updateUserPoints, getHistoricalItemDetails } = useUser();
  const [scheduledPickups, setScheduledPickups] = useState<ScheduledPickup[]>([]);
  const [listedItems, setListedItems] = useState<ListedItem[]>([]);
  const [isPickupsLoading, setIsPickupsLoading] = useState(true);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [organizationNames, setOrganizationNames] = useState<{[key: string]: string}>({});
  // Track which pickups are completed and ready for claiming points
  const [completedPickupIds, setCompletedPickupIds] = useState<string[]>([]);
  // State to track if AsyncStorage loading is complete
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // Load completed IDs from storage on mount
  useEffect(() => {
    const loadCompletedIds = async () => {
      try {
        const storedIds = await AsyncStorage.getItem(COMPLETED_PICKUPS_STORAGE_KEY);
        if (storedIds) {
          setCompletedPickupIds(JSON.parse(storedIds));
        }
      } catch (e) {
        console.error("Failed to load completed pickup IDs from storage", e);
      }
      setIsStorageLoaded(true); // Indicate storage loading is complete
    };
    loadCompletedIds();
  }, []);

  // Load data when component mounts, only after storage is loaded
  useEffect(() => {
    if (isStorageLoaded) {
      loadData();
    }
  }, [isStorageLoaded]); // Depend on storage loaded state

  // Refresh data when screen comes into focus, only after storage is loaded
  useFocusEffect(
    useCallback(() => {
      if (isStorageLoaded) {
        loadData();
      }
    }, [isStorageLoaded]) // Depend on storage loaded state
  );

  const loadData = async () => {
    if (user) {
      // Load pickups
      setIsPickupsLoading(true);
      const allPickups = await getScheduledPickups();
      
      // Add console log to check pickup data
      console.log("Loaded all pickups:", allPickups.length);
      // Log how many pickups have readyForClaiming=true
      const readyToClaimCount = allPickups.filter(p => p.readyForClaiming === true).length;
      console.log("Pickups ready for claiming:", readyToClaimCount);
      
      // Filter pickups to display: Show all that aren't fully completed or cancelled,
      // or ones that are recycled but still ready for claiming points
      const displayPickups = allPickups.filter(pickup => 
        (pickup.pickupStatus !== 'Recycled' && pickup.pickupStatus !== 'Cancelled') ||
        // Include Recycled pickups that are still ready for claiming points
        // @ts-ignore - readyForClaiming may not be in the type definition
        (pickup.pickupStatus === 'Recycled' && pickup.readyForClaiming === true)
      );
      
      setScheduledPickups(displayPickups); // Use the refined list
      
      // Load organization names for the pickups we are displaying
      const orgNames: {[key: string]: string} = {};
      for (const pickup of displayPickups) { // Iterate over displayPickups
        if (pickup.organizationId) {
          const orgName = await getOrganizationName(pickup.organizationId);
          orgNames[pickup.id] = orgName;
        }
      }
      setOrganizationNames(orgNames);
      
      setIsPickupsLoading(false);

      // Load listed items
      setIsItemsLoading(true);
      const items = await getListedItems();
      
      // Create a set of all item IDs that are in any pickup (including completed ones)
      const itemsInAnyPickup = new Set<string>();
      allPickups.forEach(pickup => {
        pickup.listedItemIds.forEach(itemId => {
          itemsInAnyPickup.add(itemId);
        });
      });
      
      // Create a set of items that should not appear in the listed items section:
      // 1. Items in recycled pickups that are not ready for claiming
      // 2. Items in pickups ready for claiming (regardless of status)
      const itemsToHide = new Set<string>();
      
      // Add items from recycled pickups (not ready for claiming)
      allPickups
        .filter(p => (p.status === 'Recycled' || p.pickupStatus === 'Recycled') && p.readyForClaiming !== true)
        .forEach(pickup => {
          pickup.listedItemIds.forEach(itemId => {
            itemsToHide.add(itemId);
          });
        });
      
      // Add items from any pickup that is ready for claiming
      allPickups
        .filter(p => p.readyForClaiming === true)
        .forEach(pickup => {
          pickup.listedItemIds.forEach(itemId => {
            itemsToHide.add(itemId);
          });
        });
      
      // Only show items that aren't in the hide list
      const filteredItems = items.filter(item => !itemsToHide.has(item.id));
      console.log("Filtered out", items.length - filteredItems.length, "items from the listed items view");
      
      setListedItems(filteredItems);
      
      setIsItemsLoading(false);
    }
  };

  // Helper function to check if an item is in any scheduled pickup
  const isItemInPickup = (itemId: string) => {
    return scheduledPickups.some(pickup => 
      pickup.listedItemIds.includes(itemId) && 
      (pickup.status === 'Pending' || pickup.status === 'Out for pickup' || pickup.status === 'Collected') &&
      (pickup.pickupStatus !== 'Recycled' && pickup.pickupStatus !== 'Cancelled')
    );
  };

  // Helper function to get status display text
  const getStatusText = (pickup: ScheduledPickup) => {
    // Check if this pickup is ready for claiming FIRST
    // @ts-ignore
    if (pickup.readyForClaiming === true) {
      return 'Completed';
    }
    
    // If not ready for claiming, show the regular status
    switch(pickup.status) {
      case 'Pending':
        return 'Not Collected';
      case 'Out for pickup':
        return 'Out for Pickup';
      case 'Collected':
        return 'Collected';
      default:
        return pickup.status;
    }
  };

  // Helper function to get status color
  const getStatusColor = (pickup: ScheduledPickup) => {
    // Check if this pickup is in our "completedPickupIds" array
    if (completedPickupIds.includes(pickup.id)) {
      return '#2196F3'; // Blue for Completed
    }
    
    switch(pickup.status) {
      case 'Pending':
        return '#F57C00'; // Orange
      case 'Out for pickup':
        return '#5E4DCD'; // Purple
      case 'Collected':
        return '#4CAF50'; // Green
      default:
        return '#666666';
    }
  };

  // Helper function to check if pickup is ready for claiming points
  const isReadyForClaiming = (pickup: ScheduledPickup) => {
    // @ts-ignore - We're intentionally using a property that's not in the type definition
    return pickup.readyForClaiming === true;
  };

  // Function to handle claiming points for completed pickups
  const handleClaimPoints = async (pickup: ScheduledPickup) => {
    console.log("Starting point claim process for pickup:", pickup.id);
    
    // Calculate points based on item types
    let totalPoints = 0;
    
    // Check if the pickup has items directly in its items property
    if (pickup.items && pickup.items.length > 0) {
      console.log("Using items directly from pickup:", pickup.items.length);
      
      // We need to fetch the full item details to get their types for point calculation
      const itemsWithTypes: ListedItem[] = [];
      
      // For each item in the pickup, try to find its full details
      for (const pickupItem of pickup.items) {
        // Try to find in listedItems first
        const itemFromList = listedItems.find(item => item.id === pickupItem.id);
        if (itemFromList) {
          itemsWithTypes.push(itemFromList);
        } else {
          // If not in listedItems, fetch individually (this might be needed for items filtered out)
          try {
            const itemDetails = await getHistoricalItemDetails(pickupItem.id);
            if (itemDetails) {
              itemsWithTypes.push(itemDetails);
            } else {
              console.warn(`Could not find details for item ${pickupItem.id}`);
            }
          } catch (error) {
            console.error(`Error fetching details for item ${pickupItem.id}:`, error);
          }
        }
      }
      
      if (itemsWithTypes.length === 0) {
        console.error("Could not find item details for any items in pickup:", pickup.id);
        Alert.alert(
          "Error",
          "Could not retrieve item details for this pickup. Please try again later or contact support."
        );
        return;
      }
      
      // Calculate points based on item type
      itemsWithTypes.forEach(item => {
        let itemPoints = 0;
        switch(item.type) {
          case 'Smartphone':
          case 'Phone':
            itemPoints = 50;
            break;
          case 'Laptop':
            itemPoints = 100;
            break;
          case 'Tablet':
            itemPoints = 75;
            break;
          case 'Battery':
            itemPoints = 25;
            break;
          case 'Charger':
            itemPoints = 15;
            break;
          default:
            itemPoints = 10;
        }
        totalPoints += itemPoints;
        console.log(`Item ${item.id} (${item.name}, ${item.type}): ${itemPoints} points`);
      });
      
      console.log(`Total points to be awarded: ${totalPoints}`);
      
      // Update user points
      if (user) {
        console.log(`Current user points: ${user.points}`);
        console.log(`New total will be: ${(user.points || 0) + totalPoints}`);
        
        // Update the pickup status to Recycled to indicate it's been processed
        const updatedPickup: ScheduledPickup = {
          ...pickup,
          status: 'Recycled', // Mark as recycled since points have been claimed
          pickupStatus: 'Recycled',
          // @ts-ignore - Setting readyForClaiming to false since points are claimed
          readyForClaiming: false,
          // Make sure we preserve the items and listedItemIds
          items: pickup.items || [],
          listedItemIds: pickup.listedItemIds || []
        };
        
        console.log("Updating pickup to Recycled status:", updatedPickup.id);
        
        // Update the pickup
        updatePickup(updatedPickup);
        
        // Calculate the new total points by adding to existing points
        const newTotalPoints = (user.points || 0) + totalPoints;
        
        console.log(`Updating user points from ${user.points} to ${newTotalPoints}`);
        
        // Update user points with the new total
        updateUserPoints(newTotalPoints);
        
        Alert.alert(
          "Points Claimed!",
          `You've earned ${totalPoints} points for recycling your e-waste!`,
          [
            {
              text: "OK",
              onPress: () => {
                console.log("Reloading data after points claim");
                loadData(); // Reload data to reflect changes
              }
            }
          ]
        );
      } else {
        console.error("Cannot claim points: User is not logged in");
      }
    } else {
      console.error("Pickup has no items:", pickup.id);
      Alert.alert(
        "Error",
        "This pickup has no items associated with it. Please contact support."
      );
    }
  };

  const handleViewPickup = (pickupId: string) => {
    navigation.navigate('PickupDetails', { pickupId });
  };

  const handleEditPickup = (pickup: ScheduledPickup) => {
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
          text: "Mark as Collected",
          onPress: async () => {
            // In a real app, this would call an API to update the pickup
            const updatedPickup: ScheduledPickup = {
              ...pickup,
              status: 'Collected',
              date: new Date().toISOString().split('T')[0]
            };
            
            // Update the pickup
            updatePickup(updatedPickup);
            
            Alert.alert(
              "Success", 
              "Pickup has been marked as collected."
            );
            
            // Trigger data reload to reflect the changes
            loadData();
          }
        },
        {
          text: "Mark as Completed",
          onPress: async () => {
            // Add debug logging
            console.log("1. STARTING Mark as Completed process for pickup ID:", pickup.id);
            
            // Mark as collected in the database and add readyForClaiming property
            const updatedPickup: ScheduledPickup = {
              ...pickup,
              status: 'Collected', // This is a valid status in the ScheduledPickup type
              date: new Date().toISOString().split('T')[0],
              // Add readyForClaiming with @ts-ignore since it's not in the type definition
              // @ts-ignore
              readyForClaiming: true
            };
            
            console.log("3. Updated pickup object with readyForClaiming:", updatedPickup);
            
            // Update the pickup in the backend
            updatePickup(updatedPickup);
            console.log("4. Called updatePickup");
            
            // Also update it in our local state immediately
            setScheduledPickups(prev => 
              prev.map(p => p.id === pickup.id ? 
                {
                  ...p,
                  // @ts-ignore - Adding property not in type definition
                  readyForClaiming: true
                } : p
              )
            );
            console.log("5. Updated local scheduledPickups state");
            
            Alert.alert(
              "Success", 
              "Pickup has been marked as completed. You can now claim your points!"
            );
            
            // Trigger data reload to reflect the changes
            console.log("6. Calling loadData");
            loadData();
          }
        },
        {
          text: "Mark as Cancelled",
          style: "destructive",
          onPress: async () => {
            // In a real app, this would call an API to update the pickup
            const updatedPickup: ScheduledPickup = {
              ...pickup,
              status: 'Cancelled',
              date: new Date().toISOString().split('T')[0]
            };
            
            // Update the pickup
            updatePickup(updatedPickup);
            
            // Remove from completed pickups if it was there and save to storage
            const updatedIds = completedPickupIds.filter(id => id !== pickup.id);
            setCompletedPickupIds(updatedIds);
            try {
              await AsyncStorage.setItem(COMPLETED_PICKUPS_STORAGE_KEY, JSON.stringify(updatedIds));
            } catch (e) {
              console.error("Failed to save completed pickup IDs to storage", e);
            }
            
            Alert.alert(
              "Success", 
              "Pickup has been cancelled."
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
            ) : scheduledPickups.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No scheduled pickups</Text>
              </View>
            ) : (
              // Sort pickups: Completed > Pending > Collected
              [...scheduledPickups]
                .sort((a, b) => {
                  // @ts-ignore
                  const aIsReady = a.readyForClaiming === true;
                  // @ts-ignore
                  const bIsReady = b.readyForClaiming === true;

                  if (aIsReady !== bIsReady) {
                    return aIsReady ? -1 : 1; // Ready items come first
                  }

                  // If readiness is the same, sort by Pending > Collected
                  if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                  if (b.status === 'Pending' && a.status !== 'Pending') return 1;
                  
                  return 0; // Keep original order otherwise
                })
                .map((pickup) => (
                  <View key={pickup.id} style={styles.tableRow}>
                    <View style={styles.pickupInfo}>
                      <Text style={styles.facilityText}>
                        {organizationNames[pickup.id] || 'Unknown Facility'}
                      </Text>
                      {pickup.collector && (
                        <Text style={styles.collectorText}>
                          Collector: {pickup.collector}
                        </Text>
                      )}
                      <View style={[styles.statusTag, {
                        backgroundColor: getStatusColor(pickup)
                      }]}>
                        <Text style={styles.statusText}>
                          {getStatusText(pickup)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.actionButtons}>
                      {isReadyForClaiming(pickup) ? (
                        <TouchableOpacity 
                          style={styles.claimButton} 
                          onPress={() => handleClaimPoints(pickup)}
                        >
                          <Text style={styles.claimButtonText}>Claim Points</Text>
                        </TouchableOpacity>
                      ) : (
                        <>
                          <TouchableOpacity 
                            style={styles.iconButton} 
                            onPress={() => handleViewPickup(pickup.id)}
                          >
                            <Icon name="visibility" size={24} color="#666" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.iconButton} 
                            onPress={() => handleEditPickup(pickup)}
                          >
                            <Icon name="edit" size={24} color="#666" />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                ))
            )}
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
    position: 'relative',
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
  pickupInfo: {
    flex: 1,
  },
  facilityText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  collectorText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
    marginBottom: 80, // Increased to account for bottom nav
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
    height: 60,
    zIndex: 999,
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
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#757575',
    fontSize: 14,
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
  statusTag: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  claimButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen; 