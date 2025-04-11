import React, { useRef, useState } from "react";
import { View, TextInput, Text, Button, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import polyline from "@mapbox/polyline";

// OpenStreetMap doesn't require an API key
// const GOOGLE_MAPS_API_KEY = "AIzaSyDqpBZYwzP8m_L8du5imDrLUQHYIUZFHtU";

const NavigationMap = () => {
  const mapRef = useRef(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [originText, setOriginText] = useState("");
  const [destinationText, setDestinationText] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);

  const fetchAutocompleteSuggestions = async (input, setSuggestions) => {
    if (!input) {
      setSuggestions([]);
      return;
    }
    
    // Using Nominatim for address search with countrycodes=my to limit to Malaysia
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&countrycodes=my&limit=5`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'SEG_Group1_Frontend/1.0'
        }
      });
      const data = await response.json();
      
      // Transform response to match expected format
      const suggestions = data.map(item => ({
        place_id: item.place_id,
        description: item.display_name,
      }));
      
      setSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching autocomplete:", error);
    }
  };

  const getCoordinatesFromPlaceID = async (placeID, description) => {
    // Instead of using place_id, we'll search for the address text directly
    // Limit to Malaysia with countrycodes=my
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(description)}&countrycodes=my&limit=1`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'SEG_Group1_Frontend/1.0'
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

  const handleSelectOrigin = async (place) => {
    setOriginText(place.description);
    setOriginSuggestions([]);

    const coords = await getCoordinatesFromPlaceID(place.place_id, place.description);
    if (coords) {
      setOrigin({ latitude: coords.lat, longitude: coords.lng });
    }
  };

  const handleSelectDestination = async (place) => {
    setDestinationText(place.description);
    setDestinationSuggestions([]);

    const coords = await getCoordinatesFromPlaceID(place.place_id, place.description);
    if (coords) {
      setDestination({ latitude: coords.lat, longitude: coords.lng });
    }
  };

  const fetchRoute = async () => {
    if (!origin || !destination) return;

    // Using OSRM for routing
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=polyline`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Decode the polyline
        const decodedPolyline = polyline.decode(route.geometry).map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }));
        
        setRouteCoords(decodedPolyline);
        
        // Set route info with distance and duration
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(2), // Convert meters to kilometers
          duration: Math.round(route.duration / 60), // Convert seconds to minutes
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

  return (
    <View style={styles.container}>
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
      >
        {origin && <Marker coordinate={origin} title="Current Location" />}
        {destination && <Marker coordinate={destination} title="Destination" />}
        {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />}
        
        {/* OSM Attribution */}
        <View style={styles.attributionContainer}>
          <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
        </View>
      </MapView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Current Location"
          value={originText}
          onChangeText={(text) => {
            setOriginText(text);
            fetchAutocompleteSuggestions(text, setOriginSuggestions);
          }}
        />
        <FlatList
          data={originSuggestions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectOrigin(item)}>
              <Text style={styles.suggestionItem}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />

        <TextInput
          style={styles.input}
          placeholder="Destination"
          value={destinationText}
          onChangeText={(text) => {
            setDestinationText(text);
            fetchAutocompleteSuggestions(text, setDestinationSuggestions);
          }}
        />
        <FlatList
          data={destinationSuggestions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectDestination(item)}>
              <Text style={styles.suggestionItem}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />

        {routeInfo && (
          <View style={styles.routeInfo}>
            <Text style={styles.text}>Estimated Time: {routeInfo.duration} mins</Text>
            <Text style={styles.text}>Distance: {routeInfo.distance} km</Text>
          </View>
        )}
        <Button title="Route" onPress={fetchRoute} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  inputContainer: { position: "absolute", top: 40, left: 10, right: 10, backgroundColor: "white", padding: 15, borderRadius: 10 },
  input: { height: 40, borderColor: "gray", borderWidth: 1, marginBottom: 10, paddingHorizontal: 8 },
  suggestionItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  routeInfo: { marginBottom: 10, backgroundColor: "#f0f0f0", padding: 10, borderRadius: 5 },
  text: { color: "black" },
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

export default NavigationMap;




