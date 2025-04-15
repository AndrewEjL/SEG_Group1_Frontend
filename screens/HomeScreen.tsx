import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated, Easing, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser, ScheduledPickup, type ListedItem } from '../contexts/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { displayItem } from './api/items/displayItems';
import { useItemTypes } from './api/items/itemTypes';
import { useDeleteItem } from './api/items/deleteItem';
import { grabTransactionOrg } from './api/transaction/grabTransactionOrg';
import { useOrganization } from './api/transaction/getOrganization';
import { useClient } from './api/user/getClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Home: {id: number};
  PickupDetails: { id:number, orgId: number};
  AddPickupItem: { id: number };
  EditListedItems: { itemId: number, id:number };
  CProfileScreen: { id:number };
  rewards: { id:number };
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
  const route = useRoute();
  const { user, getScheduledPickups, getListedItems, deleteListedItem, getOrganizationName } = useUser();
  const { itemTypes, deviceCondition, itemsStatus, loadingName } = useItemTypes();
  const {id} = route.params;
  const { displayItems, loading } = displayItem(id);
  console.log(displayItems);
  const { displayTransactionOrg, loadingT1} = grabTransactionOrg(id)
  const { displayOrg, loading: loadingOrg} = useOrganization();
  const { deleteItem, loadingDelete, error } = useDeleteItem();
  const { displayClient, loading: loadingClient } = useClient(id); 
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
      // setIsPickupsLoading(true);
      // const allPickups = await getScheduledPickups();
      // // Filter to show only ongoing pickups
      // const ongoingPickups = allPickups.filter(pickup => pickup.status === 'ongoing');
      // setScheduledPickups(ongoingPickups);
      // setIsPickupsLoading(false);

      // Load listed items
      // setIsItemsLoading(true);
      // const items = await getListedItems();
      // setListedItems(items);
      // setIsItemsLoading(false);
    }
  };

  // Helper function to check if an item is in any scheduled pickup
  const isItemInPickup = (itemId: string) => {
    return scheduledPickups.some(pickup => 
      pickup.listedItemIds.includes(itemId) && 
      pickup.status === 'ongoing'
    );
  };

  const handleViewPickup = (orgId: number) => {
    navigation.navigate('PickupDetails', { id, orgId });
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

  const handleEditItem = (itemId: number) => {
    console.log("Navigating with:", { itemId, id });
    navigation.navigate('EditListedItems', { itemId, id });
  };

  const handleDeleteItem = (itemId: number, itemName: string) => {
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
            const success = await deleteItem(itemId);
            if (success) {
              // Refresh the list after deletion
              navigation.replace('Home', {id});
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
    navigation.navigate('AddPickupItem', {id});
  };

  const handleTabPress = (tabName: string) => {
    console.log('Pressed tab:', tabName);
    if (tabName === 'profile') {
      navigation.navigate('CProfileScreen', {id});
    } else if (tabName === 'rewards') {
      navigation.navigate('rewards', {id});
    }
  };

  

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>E-Waste App</Text>
        <View style={styles.pointsContainer}>
          <Icon name="stars" size={20} color="#5E4DCD" />
          <Text style={styles.points}>Points {displayClient?.reward_points || 0}</Text>
        </View>    
      </View>

      {/* Scheduled Pickups Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Scheduled Pickups</Text>
        <View style={styles.tableContainer}>
          <ScrollView style={styles.scrollView}>
            {displayTransactionOrg.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No Scheduled listed yet</Text>
              </View>
            ) : (
              displayTransactionOrg.map((pickup) => {
                const organization = displayOrg.find((org) => org.organizationID === pickup.organization_id);
                console.log(pickup)
                return(
                <View key={pickup.pickup_transaction_id} style={styles.tableRow}>              
                  <Text style={styles.facilityText}>
                    {organization?.organization_name}
                  </Text>                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.iconButton} 
                      onPress={() => handleViewPickup(pickup.organization_id)}
                    >
                      <Icon name="visibility" size={24} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.iconButton} 
                      onPress={() => handleEditPickup(pickup.pickup_transaction_id)}
                    >
                      <LoadingIcon />
                    </TouchableOpacity>
                  </View>
                </View>
                )
              
            })
            )}
          </ScrollView>
        </View>
      </View>

      {/* Listed Items Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Listed Items</Text>
        <View style={styles.tableContainer}>
          <ScrollView style={styles.scrollView}>
            {displayItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No items listed yet</Text>
              </View>
            ) : (
              displayItems
              .sort((a, b) => (a.item_status_id === 1 ? -1 : b.item_status_id === 1 ? 1 : 0))
              .map((item) => {
                const type = itemTypes.find((t) => t.id === item.item_type_id);
                const condition = deviceCondition.find((t) => t.id === item.device_condition_id);
                const status = itemsStatus.find((t) => t.id === item.item_status_id)
                return(
                  <View key={item.pickup_items_id} style={styles.tableRow}>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemText}>{item.item_name}</Text>
                      <Text style={styles.itemSubtext}>
                        {type?.name} • {condition?.name}
                      </Text>
                      <Text style={styles.itemStatus}>
                        {status?.name}
                      </Text>
                      {/* <Text style={styles.listingStatus}>
                        Listing
                      </Text> */}
                  
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.iconButton} 
                        onPress={() => handleEditItem(item.pickup_items_id)}
                        disabled={item.item_status_id !== 1}
                      >
                        <Icon name="edit" size={24} color="#666" />
                      </TouchableOpacity>
                      {item.item_status_id == 1 && (
                      <TouchableOpacity 
                        style={styles.deleteButton} 
                        onPress={() => handleDeleteItem(item.pickup_items_id, item.item_name)}
                      >
                        <Icon name="close" size={24} color="#D32F2F" />
                      </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )
                
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