import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated, Easing, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser, DevAutoLogin, ScheduledPickup, type ListedItem } from '../contexts/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { displayItem } from './api/items/displayItems';
import { useItemTypes } from './api/items/itemTypes';
import { useDeleteItem } from './api/items/deleteItem';
import { grabTransactionOrg } from './api/transaction/grabTransactionOrg';
import { useOrganization } from './api/transaction/getOrganization';

type RootStackParamList = {
  Home: {id: number};
  PickupDetails: { id:number, orgId: number};
  AddPickupItem: { id: number };
  EditListedItems: { itemId: number, id:number };
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
  const route = useRoute();
  const { user, getScheduledPickups, getListedItems, deleteListedItem } = useUser();
  const { itemTypes, deviceCondition, itemsStatus, loadingName } = useItemTypes();
  const {id} = route.params;
  const { displayItems, loading } = displayItem(id);
  const { displayTransactionOrg, loadingT1} = grabTransactionOrg(id)
  const { displayOrg, loading: loadingOrg} = useOrganization();
  const { deleteItem, loadingDelete, error } = useDeleteItem();
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
      // setIsPickupsLoading(true);
      // const pickups = await getScheduledPickups();
      // setScheduledPickups(pickups);
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
    return scheduledPickups.some(pickup => pickup.listedItemIds.includes(itemId));
  };

  const handleViewPickup = (orgId: number) => {
    navigation.navigate('PickupDetails', { id, orgId });
  };

  const handleEditPickup = (pickupId: string) => {
    // TODO: Implement edit pickup functionality
    Alert.alert('Coming Soon', 'Edit pickup functionality will be available soon');
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
              navigation.navigate('Home', {id});
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
            {displayTransactionOrg.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No Scheduled listed yet</Text>
              </View>
            ) : (
              displayTransactionOrg.map((pickup) => {
                const organization = displayOrg.find((org) => org.organizationID === pickup.organization_id);

                return(
                <View key={pickup.pickup_transaction_id} style={styles.tableRow}>              
                  <Text style={styles.facilityText}>
                    {/* {organization?.organization_name} */}
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