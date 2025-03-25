import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  Platform, 
  Keyboard, 
  TextInput,
  Button,
  TouchableWithoutFeedback,
  KeyboardAvoidingView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView, { Marker } from 'react-native-maps';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { useItemTypes } from './api/items/itemTypes';
import { addItem } from './api/items/addItem';

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyDqpBZYwzP8m_L8du5imDrLUQHYIUZFHtU";

type RootStackParamList = {
  MapScreen: {
    id: number;
    itemData: {
      name: string;
      type: number;
      condition: number;
      dimensions: {
        length: string;
        width: string;
        height: string;
      };
      quantity: string;
    };
  };
  Home: undefined;
};

type MapScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MapScreen'>;
  route: RouteProp<RootStackParamList, 'MapScreen'>;
};

const MapScreen: React.FC<MapScreenProps> = ({ navigation}) => {
  const route = useRoute();
  const { id, itemData } = route.params || {};
  const { itemTypes, deviceCondition, loading } = useItemTypes();
  const { listItem } = useUser();
  const [itemTypeName, setItemTypeName] = useState('');
  const [conditionName, setConditionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Map and location state
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    address: "",
  });

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // get item name and device condition name base on the id
  useEffect(() => {
    if (!loading && itemTypes.length > 0 && deviceCondition.length > 0) {
      const type = itemTypes.find((t) => t.id === itemData.type);
      if (type) setItemTypeName(type.name);
  
      const condition = deviceCondition.find((c) => c.id === itemData.condition);
      if (condition) setConditionName(condition.name);
    }
  }, [loading, itemTypes, deviceCondition, itemData]);
  

  // Convert address to coordinates
  const fetchCoordinates = async () => {
    if (!location.address.trim()) return;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location.address)}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "OK") {
        const { lat, lng } = data.results[0].geometry.location;
        updateLocation(lat, lng, location.address);
        Keyboard.dismiss();
      } else {
        alert("Address not found");
      }
    } catch (error) {
      console.error("Geocoding error", error);
    }
  };

  // Convert coordinates to address
  const fetchAddress = async (latitude, longitude) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "OK") {
        const formattedAddress = data.results[0]?.formatted_address || "Address not found";
        setLocation({ latitude, longitude, address: formattedAddress });
      }
    } catch (error) {
      console.error("Geolocation error:", error);
    }
  };

  // Update location state and map view
  const updateLocation = (latitude, longitude, address = "") => {
    setLocation({ latitude, longitude, address });
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  // Handle listing item
  const handleListItem = async () => {
    if (!location.address) {
        setError("Please select a location first.");
        return;
    }
    setIsLoading(true);
    setError(null);
    
    try {
      for(let i=0; i<parseInt(itemData.quantity, 10); i++){
        // Call the listItem function from UserContext
        console.log("Item ID before submitting:", id);
        if (!id) {
            setError("Error: Item ID is missing.");
            return;
        }

        const response = await addItem(
          id, 
          itemData.name, 
          itemData.type,
          itemData.condition,
          parseFloat(itemData.dimensions.length),
          parseFloat(itemData.dimensions.width),
          parseFloat(itemData.dimensions.height),
          location.address
        )

        console.log("Response from addItem:", response);

        if(!response){
          setError('Failed to list item. Please try again.');
        }
      }
      // Navigate back to home screen on success
      navigation.navigate('Home', {id});
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error listing item:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContentContainer,
          { paddingBottom: keyboardVisible ? 0 : 80 } // Add padding when keyboard is not visible
        ]}
        showsVerticalScrollIndicator={true}
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            {/* Map Section */}
            <View style={styles.mapWrapper}>
              <MapView
                ref={mapRef}
                style={styles.map}
                showsUserLocation={true}
                initialRegion={{
                  latitude: 1.482,
                  longitude: 103.6283,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                onPress={(e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  fetchAddress(latitude, longitude);
                }}
              >
                {location.latitude && location.longitude && (
                  <Marker
                    ref={markerRef}
                    coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                    title="Selected location"
                    draggable
                    onDragEnd={(e) => {
                      const { latitude, longitude } = e.nativeEvent.coordinate;
                      fetchAddress(latitude, longitude);
                    }}
                  />
                )}
              </MapView>

              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Address"
                  placeholderTextColor="#666666"
                  value={location.address}
                  onChangeText={(text) => setLocation({ ...location, address: text })}
                />
                <TouchableOpacity 
                  style={styles.searchButton} 
                  onPress={fetchCoordinates}
                  activeOpacity={0.7}
                >
                  <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmed Address Section */}
            <View style={styles.addressContainer}>
              <Text style={styles.confirmedText}>Confirmed Address:</Text>
              <Text style={styles.addressText}>{location.address}</Text>
            </View>
            
            {/* Item Details Section */}
            <View style={styles.itemDetailsContainer}>
              <Text style={styles.itemDetailsTitle}>Item Details:</Text>
              {/* <Text style={styles.itemDetail}>user id : {id}</Text> */}
              <Text style={styles.itemDetail}>Name: {itemData.name}</Text>
              <Text style={styles.itemDetail}>Type: {itemTypeName || 'loading'}</Text>
              <Text style={styles.itemDetail}>Condition: {conditionName || 'loading'}</Text>
              <Text style={styles.itemDetail}>Dimensions: {itemData.dimensions.length} x {itemData.dimensions.width} x {itemData.dimensions.height}</Text>
              <Text style={styles.itemDetail}>Quantity: {itemData.quantity}</Text>
            </View>

            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      {/* List Item Button - Fixed at bottom */}
      <View style={[
        styles.buttonContainer,
        { bottom: keyboardVisible ? -100 : 0 } // Move button off-screen when keyboard is visible
      ]}>
        <TouchableOpacity 
          style={styles.listButton}
          onPress={handleListItem}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.listButtonText}>List Item</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    color: '#000000',
  },
  mapWrapper: {
    height: 350,
    position: 'relative',
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    position: "absolute",
    width: "90%",
    top: 15,
    left: "5%",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    paddingHorizontal: 12,
    marginRight: 12,
    color: "#000000",
    borderRadius: 6,
    backgroundColor: '#F9F9F9',
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#5E4DCD',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addressContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderTopWidth: 0,
    borderTopColor: '#E0E0E0',
    marginTop: 0,
    borderRadius: 8,
    marginBottom: 10,
  },
  confirmedText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
  },
  addressText: {
    fontSize: 16,
    color: "#2f20fa",
    marginBottom: 5,
  },
  itemDetailsContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginTop: 0,
    borderTopWidth: 0,
    borderTopColor: '#E0E0E0',
  },
  itemDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
  },
  itemDetail: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
  },
  listButton: {
    backgroundColor: '#5E4DCD',
    paddingVertical: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  listButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MapScreen; 