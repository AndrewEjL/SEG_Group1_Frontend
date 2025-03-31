import React, { useRef, useState, useEffect } from "react";
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, Region } from "react-native-maps";

// OpenStreetMap nominatim API for geocoding
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
// OSRM API for routing - public endpoint, no API key required
const OSRM_BASE_URL = "https://router.project-osrm.org";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Type definitions
interface Coordinates {
  lat: number;
  lon: number;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface RouteInfoData {
  distance: string;
  duration: number;
}

interface LocationSuggestion {
  place_id: string;
  description: string;
  lat: number;
  lon: number;
}

interface RouteInfoProps {
  initialDestination: string;
}

const RouteInfo: React.FC<RouteInfoProps> = ({ initialDestination }) => {
  const mapRef = useRef<MapView | null>(null);
  const [origin, setOrigin] = useState<LocationCoords | null>(null);
  const [originText, setOriginText] = useState("");
  const [routeCoords, setRouteCoords] = useState<LocationCoords[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfoData | null>(null);
  const [destination, setDestination] = useState<LocationCoords | null>(null);
  const [originSuggestions, setOriginSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (initialDestination) {
      getCoordinatesFromAddress(initialDestination).then((coords) => {
        if (coords) {
          setDestination({
            latitude: coords.lat,
            longitude: coords.lon
          });

          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: coords.lat,
              longitude: coords.lon,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
          }
        }
      });
    }
  }, [initialDestination]);

  const getCoordinatesFromAddress = async (address: string): Promise<Coordinates | null> => {
    try {
      // Use Nominatim for geocoding (OpenStreetMap's geocoding service)
      const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en-US,en',
          'User-Agent': 'ReactNativeApp/1.0'
        }
      });
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
    return null;
  };

  const fetchAutocompleteSuggestions = async (input: string, setSuggestions: React.Dispatch<React.SetStateAction<LocationSuggestion[]>>) => {
    if (!input || input.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      // Use Nominatim for autocomplete suggestions
      const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(input)}&countrycodes=my&limit=5`;
      
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en-US,en',
          'User-Agent': 'ReactNativeApp/1.0'
        }
      });
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Transform data to a format similar to what we had with Google
        const suggestions = data.map((item: any) => ({
          place_id: item.place_id,
          description: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon)
        }));
        
        setSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching autocomplete:", error);
      setShowSuggestions(false);
    }
  };

  const handleSelectOrigin = (place: LocationSuggestion) => {
    setOriginText(place.description);
    setOriginSuggestions([]);
    setShowSuggestions(false);
    Keyboard.dismiss();
    
    // Place already has coordinates
    setOrigin({
      latitude: place.lat,
      longitude: place.lon
    });
  };

  const fetchRoute = async () => {
    if (!origin || !destination) {
      Alert.alert("Missing Locations", "Please select both current location and destination");
      return;
    }

    try {
      // Debugging origin and destination
      console.log("Origin:", origin);
      console.log("Destination:", destination);
      
      // Use OSRM for routing - format: lat,lng for OSRM (different from ORS)
      const url = `${OSRM_BASE_URL}/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
      
      console.log("Sending request to OSRM:", url);

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OSRM error:", response.status, errorText);
        Alert.alert("Route Error", `Failed to get route: ${response.status}`);
        return;
      }

      const data = await response.json();
      console.log("OSRM response:", JSON.stringify(data).substring(0, 200) + "...");
      
      if (data && data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Extract coordinates and convert to the format MapView expects
        const coordinates = route.geometry.coordinates.map((coord: [number, number]) => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        
        console.log(`Route found with ${coordinates.length} points`);
        setRouteCoords(coordinates);
        
        // Extract route info
        const distance = (route.distance / 1000).toFixed(2); // Convert to km
        const duration = Math.round(route.duration / 60); // Convert to minutes
        
        setRouteInfo({
          distance,
          duration
        });

        // Fit map to the route
        if (mapRef.current) {
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      } else {
        console.error("No route found in response:", data);
        Alert.alert("Route Error", "No route found between these locations");
      }
    } catch (error: any) {
      console.error("Error fetching route:", error);
      Alert.alert("Error", `Failed to fetch route: ${error.message || "Unknown error"}`);
    }
  };

  // Instead of using a FlatList for suggestions, we'll render them in a ScrollView
  // This avoids the VirtualizedList nesting warning
  const renderSuggestions = () => {
    if (!showSuggestions || originSuggestions.length === 0) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <ScrollView 
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {originSuggestions.map((item) => (
            <TouchableOpacity 
              key={item.place_id}
              style={styles.suggestionItemContainer}
              onPress={() => handleSelectOrigin(item)}
            >
              <Text style={styles.suggestionItem}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView 
          ref={mapRef} 
          style={styles.map} 
          provider={PROVIDER_DEFAULT}
          showsUserLocation={true}
          initialRegion={{
            latitude: 1.4927, // Default location (Malaysia)
            longitude: 103.7414,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {origin && <Marker coordinate={origin} title="Current Location" />}
          {destination && <Marker coordinate={destination} title="Pickup location" />}
          {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />}
        </MapView>
        {/* OSM Attribution */}
        <View style={styles.attributionContainer}>
          <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
        </View>
      </View>
      
      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TextInput
          style={styles.input}
          placeholder="Current Location"
          value={originText}
          onChangeText={(text) => {
            setOriginText(text);
            fetchAutocompleteSuggestions(text, setOriginSuggestions);
          }}
          placeholderTextColor="#999999"
        />
        
        {renderSuggestions()}
        
        {routeInfo && (
          <View style={styles.routeInfo}>
            <Text style={styles.text}>Estimated Time: {routeInfo.duration} mins</Text>
            <Text style={styles.text}>Distance: {routeInfo.distance} km</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[
            styles.getRouteButton, 
            (!origin || !destination) && styles.disabledButton
          ]} 
          onPress={fetchRoute}
          disabled={!origin || !destination}
        >
          <Text style={styles.getRouteButtonText}>Get Route</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  mapContainer: {
    width: '100%',
    height: 250, // Map height
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  attributionContainer: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 3,
    borderRadius: 3,
  },
  attributionText: {
    fontSize: 10,
    color: "#333",
  },
  controlsContainer: {
    width: '100%',
    backgroundColor: 'white',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    height: 40,
    borderColor: "#5E4DCD",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "white",
    color: '#333333',
  },
  suggestionsContainer: {
    marginBottom: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    maxHeight: 120, // Limit height to allow scrolling
  },
  suggestionItemContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  suggestionItem: {
    color: "#333333",
    fontSize: 14,
  },
  routeInfo: {
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8
  },
  text: {
    color: "#333333",
    fontSize: 14,
    marginBottom: 4,
  },
  getRouteButton: {
    backgroundColor: "#5E4DCD",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.7,
  },
  getRouteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RouteInfo;




