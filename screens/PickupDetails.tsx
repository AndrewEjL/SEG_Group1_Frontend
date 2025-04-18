import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser, ScheduledPickup, ListedItem, PickupItem } from '../contexts/UserContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  PickupDetails: { pickupId: string };
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
  const { pickupId } = route.params;
  const { getPickupDetails, getListedItems, getHistoricalItemDetails, getOrganizationName } = useUser();
  const [pickup, setPickup] = useState<ScheduledPickup | null>(null);
  const [itemDetails, setItemDetails] = useState<{ [key: string]: ListedItem | null }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [organizationName, setOrganizationName] = useState<string>('');

  useEffect(() => {
    loadPickupDetails();
  }, [pickupId]);

  const loadPickupDetails = async () => {
    setIsLoading(true);
    try {
      const details = await getPickupDetails(pickupId);
      if (details) {
        setPickup(details);
        
        // Get organization name
        if (details.organizationId) {
          const orgName = await getOrganizationName(details.organizationId);
          setOrganizationName(orgName);
        }
        
        // Get all active listed items
        const allListedItems = await getListedItems();
        const activeItemsMap = allListedItems.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {} as { [key: string]: ListedItem });
        
        // Load detailed information for each item in the pickup
        const detailsMap: { [key: string]: ListedItem | null } = {};
        
        for (const pickupItem of details.items) {
          // First check if the item exists in active listings
          if (activeItemsMap[pickupItem.id]) {
            detailsMap[pickupItem.id] = activeItemsMap[pickupItem.id];
          } else {
            // If not in active listings, try to get from historical records
            const historicalItem = await getHistoricalItemDetails(pickupItem.id);
            detailsMap[pickupItem.id] = historicalItem;
          }
        }
        
        setItemDetails(detailsMap);
      }
    } catch (error) {
      console.error('Error loading pickup details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Collected':
        return '#4CAF50'; // Green
      case 'Cancelled':
        return '#F44336'; // Red
      case 'Pending':
        return '#FFC107'; // Yellow/Amber
      case 'Out for pickup':
        return '#2196F3'; // Blue
      case 'Recycled':
        return '#4CAF50'; // Green
      default:
        return '#FFC107'; // Default to yellow/amber
    }
  };

  // Helper function to render item details safely
  const renderItemDetails = (pickupItem: PickupItem) => {
    const item = itemDetails[pickupItem.id];
    
    // If the item details are not available at all
    if (!item) {
      return (
        <View style={styles.itemCard}>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{pickupItem.name}</Text>
            <Text style={styles.itemSubtext}>
              Item details are not available
            </Text>
          </View>
        </View>
      );
    }
    
    // Item details are available (either from active listings or historical records)
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemSubtext}>
            {item.type} • {item.condition}
          </Text>
          <Text style={styles.itemDimensions}>
            Dimensions: {item.dimensions.length}×{item.dimensions.width}×{item.dimensions.height} cm
          </Text>
          <Text style={styles.itemQuantity}>
            Quantity: {item.quantity}
          </Text>
          {item.address && (
            <Text style={styles.itemAddress}>
              Address: {item.address}
            </Text>
          )}
        </View>
      </View>
    );
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LoadingIcon />
        </View>
      ) : pickup ? (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          {/* Facility Name */}
          <View style={styles.facilityContainer}>
            <Text style={styles.facilityLabel}>Facility</Text>
            <Text style={styles.facilityName}>{organizationName || 'Unknown Facility'}</Text>
            
            {/* Display pickup status */}
            <View style={[styles.statusContainer, { 
              backgroundColor: getStatusColor(pickup.status)
            }]}>
              <Text style={styles.statusText}>{pickup.status}</Text>
            </View>
          </View>

          {/* Items List */}
          <View style={styles.itemsContainer}>
            <Text style={styles.itemsLabel}>Items for Pickup</Text>
            {pickup.items.map((pickupItem) => (
              <React.Fragment key={pickupItem.id}>
                {renderItemDetails(pickupItem)}
              </React.Fragment>
            ))}
          </View>
          
          {/* Add padding at the bottom for better scrolling */}
          <View style={styles.bottomPadding} />
        </ScrollView>
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
});

export default PickupDetails; 