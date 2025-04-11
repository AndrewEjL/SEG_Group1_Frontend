import React, { useRef, useState, useEffect } from "react";
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Linking } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialIcons";
import polyline from "@mapbox/polyline";

// Add type declarations without module augmentation
// This is a simpler way to add typing for our usage without conflicts
// @ts-ignore
const polylineDecode = polyline.decode;

interface RouteInfoProps {
  initialDestination: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface RouteInfoData {
  distance: string;
  duration: number;
}

interface PlaceSuggestion {
  description: string;
  place_id?: string;
  osm_id?: string;
  lat: string;
  lon: string;
}

// No Google Maps API key needed for OpenStreetMap
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const RouteInfo: React.FC<RouteInfoProps> = ({ initialDestination }) => {
  const mapRef = useRef<MapView | null>(null);
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [originText, setOriginText] = useState<string>("");
  const [routeCoords, setRouteCoords] = useState<Coordinates[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfoData | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [originSuggestions, setOriginSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  useEffect(() => {
    if (initialDestination) {
      getCoordinatesFromAddress(initialDestination).then((coords) => {
        if (coords) {
          setDestination({ latitude: coords.lat, longitude: coords.lng });

          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: coords.lat,
              longitude: coords.lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
          }
        }
      });
    }
  }, [initialDestination]);

  const getCoordinatesFromAddress = async (address: string) => {
    // Using Nominatim API (OpenStreetMap) for geocoding
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=my`;
    try {
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en-US,en',
          'User-Agent': 'EwasteUI/1.0' // Required for Nominatim API
        }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
    return null;
  };

  const fetchAutocompleteSuggestions = async (input: string, setSuggestions: React.Dispatch<React.SetStateAction<PlaceSuggestion[]>>) => {
    if (!input) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    // Using Nominatim API for autocomplete
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&limit=5&countrycodes=my`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en-US,en',
          'User-Agent': 'EwasteUI/1.0'
        }
      });
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Transform the data to match the format our component expects
        const predictions = data.map((item: any) => ({
          description: item.display_name,
          place_id: item.place_id,
          osm_id: item.osm_id,
          lat: item.lat,
          lon: item.lon
        }));
        
        setSuggestions(predictions);
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

  const handleSelectOrigin = async (place: PlaceSuggestion) => {
    setOriginText(place.description);
    setOriginSuggestions([]);
    setShowSuggestions(false);
    Keyboard.dismiss();
    
    // Coordinates are already in the place object from Nominatim
    if (place.lat && place.lon) {
      setOrigin({
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon)
      });
    }
  };

  const fetchRoute = async () => {
    if (!origin || !destination) return;

    // Using OSRM (Open Source Routing Machine) API for directions
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=polyline`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Decode the polyline using our imported function
        const decodedPolyline = polylineDecode(route.geometry).map((point: [number, number]) => ({
          latitude: point[0],
          longitude: point[1],
        }));

        setRouteCoords(decodedPolyline);
        
        // Calculate route info
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(2), // Convert meters to km
          duration: Math.round(route.duration / 60) // Convert seconds to minutes
        });

        if (mapRef.current) {
          mapRef.current.fitToCoordinates(decodedPolyline, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching route:", error);
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
              key={item.place_id || item.osm_id}
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

  const startNavigation = () => {
    if (!destination || !origin) return;

    // For OpenStreetMap navigation, we'll use the OSMAnd app if installed, otherwise fall back to browser
    const osmUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${origin.latitude},${origin.longitude};${destination.latitude},${destination.longitude}`;
    
    // Try to open in OSMAnd app first (app-specific URL scheme)
    const osmandUrl = `osmand.navigation:q=${destination.latitude},${destination.longitude}`;
    
    Linking.canOpenURL(osmandUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(osmandUrl);
        } else {
          // Fall back to OpenStreetMap in browser
          return Linking.openURL(osmUrl);
        }
      })
      .catch(err => {
        console.error('An error with opening URL occurred', err);
        // Final fallback - open in browser
        Linking.openURL(osmUrl);
      });
  }

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
          provider={PROVIDER_DEFAULT} // Use default map provider with OSM tiles
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
        <TouchableOpacity style={styles.navigationButton} onPress={startNavigation}>
          <Icon name="navigation" size={24} color="#fff" />
        </TouchableOpacity>
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
          style={styles.getRouteButton} 
          onPress={fetchRoute}
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
  },
  map: {
    width: '100%',
    height: '100%',
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
  getRouteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  navigationButton: {
    position: 'absolute',
    bottom: 10,
    right: 5,
    backgroundColor: '#0066CC',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 100,
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
});

export default RouteInfo;




