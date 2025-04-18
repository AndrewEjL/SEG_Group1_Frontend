import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser, ScheduledPickup, ListedItem, PickupItem } from '../contexts/UserContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useOrgItem } from './api/transaction/getTransaction';
import { useOrganization } from './api/transaction/getOrganization';
import { displayItemsByItemID } from './api/items/displayItemsByItemID';
import { useItemTypes } from './api/items/itemTypes';

type RootStackParamList = {
  PickupDetails: { id: number, orgId: number };
};

type PickupDetailsProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PickupDetails'>;
  route: RouteProp<RootStackParamList, 'PickupDetails'>;
};

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

const PickupDetails: React.FC<PickupDetailsProps> = ({ navigation, route }) => {
  const { id, orgId } = route.params;
  const { displayOrgItem, loading: loadingOrgItem } = useOrgItem(id, orgId)
  const { displayOrg, loading: loadingOrg} = useOrganization();
  const pickupItemID = displayOrgItem.map(item => item.pickup_item_id);
  const { displayItems: displayItemByID, loading } = displayItemsByItemID(pickupItemID);
  const { itemTypes, deviceCondition, itemsStatus, pickupStatus, loadingName } = useItemTypes();
  const [pickup, setPickup] = useState<ScheduledPickup | null>(null);
  const [itemDetails, setItemDetails] = useState<{ [key: string]: ListedItem | null }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [organizationName, setOrganizationName] = useState<string>('');

  // useEffect(() => {
  //   loadPickupDetails();
  // }, [pickupId]);

  // const loadPickupDetails = async () => {
  //   setIsLoading(true);
  //   try {
  //     const details = await getPickupDetails(pickupId);
  //     if (details) {
  //       setPickup(details);
        
  //       // Get all active listed items
  //       const allListedItems = await getListedItems();
  //       const activeItemsMap = allListedItems.reduce((acc, item) => {
  //         acc[item.id] = item;
  //         return acc;
  //       }, {} as { [key: string]: ListedItem });
        
  //       // Load detailed information for each item in the pickup
  //       const detailsMap: { [key: string]: ListedItem | null } = {};
        
  //       for (const pickupItem of details.items) {
  //         // First check if the item exists in active listings
  //         if (activeItemsMap[pickupItem.id]) {
  //           detailsMap[pickupItem.id] = activeItemsMap[pickupItem.id];
  //         } else {
  //           // If not in active listings, try to get from historical records
  //           const historicalItem = await getHistoricalItemDetails(pickupItem.id);
  //           detailsMap[pickupItem.id] = historicalItem;
  //         }
  //       }
        
  //       setItemDetails(detailsMap);
  //     }
  //   } catch (error) {
  //     console.error('Error loading pickup details:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // // Helper function to render item details safely
  // const renderItemDetails = (pickupItem: PickupItem) => {
  //   const item = itemDetails[pickupItem.id];
    
  //   // If the item details are not available at all
  //   if (!item) {
  //     return (
  //       <View style={styles.itemCard}>
  //         <View style={styles.itemDetails}>
  //           <Text style={styles.itemName}>{pickupItem.name}</Text>
  //           <Text style={styles.itemSubtext}>
  //             Item details are not available
  //           </Text>
  //         </View>
  //       </View>
  //     );
  //   }
    
  //   // Item details are available (either from active listings or historical records)
  //   return (
  //     <View style={styles.itemCard}>
  //       <View style={styles.itemDetails}>
  //         <Text style={styles.itemName}>{item.name}</Text>
  //         <Text style={styles.itemSubtext}>
  //           {item.type} • {item.condition}
  //         </Text>
  //         <Text style={styles.itemDimensions}>
  //           Dimensions: {item.dimensions.length}×{item.dimensions.width}×{item.dimensions.height} cm
  //         </Text>
  //         <Text style={styles.itemQuantity}>
  //           Quantity: {item.quantity}
  //         </Text>
  //         {item.address && (
  //           <Text style={styles.itemAddress}>
  //             Address: {item.address}
  //           </Text>
  //         )}
  //       </View>
  //     </View>
  //   );
  // };
  const getStatusColor = (status: number) => {
    if (status === 1) return '#F57C00'; // Orange for pending
    if (status === 2) return '#5E4DCD'; // Purple for Collecting
    return '#FFC107'; // Default yellow
  };
  
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
        <Text style={styles.title}>Pickup Details</Text>
        <View style={styles.headerRight} />
      </View>

      {loadingOrgItem ? (
        <View style={styles.loadingContainer}>
          <LoadingIcon />
        </View>
      ) : displayOrgItem.length > 0 ? (
        // Get the organization only once (assuming all items belong to the same org)
        (() => {
          const organization = displayOrg.find((org) => org.organizationID === displayOrgItem[0]?.organization_id);
          return (
            <ScrollView 
              style={styles.content}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={true}
              bounces={true}
            >
              {/* Facility Name (Rendered Only Once) */}
              <View style={styles.facilityContainer}>
                <Text style={styles.facilityLabel}>Facility</Text>
                <Text style={styles.facilityName}>{organization?.organization_name}</Text>
              </View>

              {/* Items List */}
              <View style={styles.itemsContainer}>
                <Text style={styles.itemsLabel}>Items for Pickup</Text>
                {displayItemByID.length > 0 ? (
                  displayItemByID.map((item) => {
                    const type = itemTypes.find((t) => t.id === item.item_type_id);
                    const cond = deviceCondition.find((t) => t.id === item.device_condition_id);
                    const pickup = displayOrgItem.find((t) => t.pickup_item_id === item.pickup_items_id);
                    const pickStatus = pickupStatus.find((t) => t.id === pickup?.pickup_status_id);

                    return(
                      <View key={item.pickup_items_id} style={styles.itemCard}>
                      <View style={styles.itemDetails}>
                        <View style={[styles.statusBadge,{ backgroundColor: getStatusColor(pickup?.pickup_status_id) }]}> 
                          <Text style={styles.statusText}>{pickStatus?.name}</Text>
                        </View>                      
                        <Text style={styles.itemName}>{item.item_name}</Text>
                        <Text style={styles.itemSubtext}>{type?.name} • {cond?.name}</Text>
                        <Text style={styles.itemDimensions}>
                          Dimensions: {item.dimension_length}×{item.dimension_width}×{item.dimension_height} cm
                        </Text>
                        <Text style={styles.itemAddress}>Address: {item.pickup_location}</Text>
                      </View>
                    </View>
                    )                    
                  })
                ) : (
                  <Text style={styles.noItemsText}>No items available</Text>
                )}
              </View>
                            
              {/* Add padding at the bottom for better scrolling */}
              <View style={styles.bottomPadding} />
            </ScrollView>
          );
        })()
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Pickup not found</Text>
        </View>
      )}
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
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  facilityContainer: {
    marginBottom: 24,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
  },
  facilityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemsContainer: {
    flex: 1,
  },
  itemsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemDimensions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bottomPadding: {
    height: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
  },
  statusContainer: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
});

export default PickupDetails; 