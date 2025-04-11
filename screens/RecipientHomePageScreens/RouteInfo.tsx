import React, { useRef, useState, useEffect } from "react";
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import polyline from "@mapbox/polyline";

const GOOGLE_MAPS_API_KEY = "AIzaSyDqpBZYwzP8m_L8du5imDrLUQHYIUZFHtU";
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const RouteInfo = ({ initialDestination }) => {
  const mapRef = useRef(null);
  const [origin, setOrigin] = useState(null);
  const [originText, setOriginText] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [destination, setDestination] = useState(null);
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const getCoordinatesFromAddress = async (address) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "OK") {
        return data.results[0].geometry.location;
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
    return null;
  };

  const fetchAutocompleteSuggestions = async (input, setSuggestions) => {
    if (!input) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${GOOGLE_MAPS_API_KEY}&components=country:MY`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "OK") {
        setSuggestions(data.predictions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching autocomplete:", error);
      setShowSuggestions(false);
    }
  };

  const getCoordinatesFromPlaceID = async (placeID) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeID}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "OK") {
        return { latitude: data.results[0].geometry.location.lat, longitude: data.results[0].geometry.location.lng };
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
    return null;
  };

  const handleSelectOrigin = async (place) => {
    setOriginText(place.description);
    setOriginSuggestions([]);
    setShowSuggestions(false);
    Keyboard.dismiss();
    const coords = await getCoordinatesFromPlaceID(place.place_id);
    if (coords) {
      setOrigin(coords);
    }
  };

  const fetchRoute = async () => {
    if (!origin || !destination) return;

    const url = `https://routes.googleapis.com/directions/v2:computeRoutes`;
    const body = {
      origin: { location: { latLng: { latitude: origin.latitude, longitude: origin.longitude } } },
      destination: { location: { latLng: { latitude: destination.latitude, longitude: destination.longitude } } },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      routeModifiers: { avoidTolls: false, avoidHighways: false, avoidFerries: false },
      languageCode: "en-US",
      units: "IMPERIAL",
    };

    try {
      let response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
        },
        body: JSON.stringify(body),
      });

      let data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const decodedPolyline = polyline.decode(route.polyline.encodedPolyline).map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }));

        setRouteCoords(decodedPolyline);
        setRouteInfo({
          distance: (route.distanceMeters / 1000).toFixed(2),
          duration: Math.round(parseInt(route.duration.replace("s", ""), 10) / 60),
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
});

export default RouteInfo;




