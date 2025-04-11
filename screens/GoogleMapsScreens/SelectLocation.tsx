import React, { useRef, useState } from "react";
import { Text, View, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

// OpenStreetMap doesn't require an API key
// const GOOGLE_MAPS_API_KEY = "AIzaSyDqpBZYwzP8m_L8du5imDrLUQHYIUZFHtU";

const SelectLocation = ({ onLocationSelect }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    address: "",
  });
 //Convert address to coordinate
  const fetchCoordinates = async () => {
    if (!location.address.trim()) return;

    // Use Nominatim for geocoding with countrycodes=my to limit to Malaysia
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location.address)}&countrycodes=my&limit=1`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'SEG_Group1_Frontend/1.0'
        }
      });
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        updateLocation(lat, lon, location.address);
        Keyboard.dismiss();
      } else {
        alert("Address not found");
      }
    } catch (error) {
      console.error("Geocoding error", error);
    }
  };
 //Convert coordinate to address
  const fetchAddress = async (latitude, longitude) => {
    // Use Nominatim for reverse geocoding
    // The countrycodes parameter is not needed for reverse geocoding as it's based on coordinates
    // But we can validate if the returned country is Malaysia in the response
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'SEG_Group1_Frontend/1.0'
        }
      });
      const data = await response.json();
      
      if (data) {
        // Check if the location is in Malaysia
        const isInMalaysia = data.address && 
          (data.address.country === "Malaysia" || 
           data.address.country_code === "my");
        
        if (isInMalaysia) {
          const formattedAddress = data.display_name || "Address not found";
          setLocation({ latitude, longitude, address: formattedAddress });
          onLocationSelect(formattedAddress);
        } else {
          alert("Please select a location within Malaysia");
        }
      }
    } catch (error) {
      console.error("Geolocation error:", error);
    }
  };

  const updateLocation = (latitude, longitude, address = "") => {
    setLocation({ latitude, longitude, address });
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      enabled
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.mapWrapper}>
              <MapView
                ref={mapRef}
                provider={PROVIDER_DEFAULT}
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
                
                {/* OSM Attribution */}
                <View style={styles.attributionContainer}>
                  <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
                </View>
              </MapView>

              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Address"
                  placeholderTextColor="#666666"
                  value={location.address}
                  onChangeText={(text) => setLocation({ ...location, address: text })}
                />
                <Button title="Search" onPress={fetchCoordinates} />
              </View>
            </View>

            <View style={styles.addressContainer}>
              <Text style={styles.confirmedText}>Confirmed Address:</Text>
              <Text style={styles.addressText}>{location.address}</Text>
            </View>
            
            {/* Add extra padding at the bottom when keyboard is open */}
            <View style={styles.keyboardSpacer} />
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  mapWrapper: {
    height: 400, // Fixed height for map
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    position: "absolute",
    width: "95%",
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 8,
    marginRight: 10,
    color: "#000000",
    borderRadius: 5,
  },
  addressContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 10,
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
  keyboardSpacer: {
    height: 100, // Extra space at the bottom
  },
  attributionContainer: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 3,
    borderRadius: 3,
    zIndex: 1,
  },
  attributionText: {
    fontSize: 10,
    color: "#333",
  },
});

export default SelectLocation;