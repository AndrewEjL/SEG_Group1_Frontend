import React, { useRef, useState } from "react";
import { View, TextInput, Text, Button, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import polyline from "@mapbox/polyline";

const GOOGLE_MAPS_API_KEY = "AIzaSyDqpBZYwzP8m_L8du5imDrLUQHYIUZFHtU";

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
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "OK") {
        setSuggestions(data.predictions);
      }
    } catch (error) {
      console.error("Error fetching autocomplete:", error);
    }
  };

  const getCoordinatesFromPlaceID = async (placeID) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeID}&key=${GOOGLE_MAPS_API_KEY}`;

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

  const handleSelectOrigin = async (place) => {
    setOriginText(place.description);
    setOriginSuggestions([]);

    const coords = await getCoordinatesFromPlaceID(place.place_id);
    if (coords) {
      setOrigin({ latitude: coords.lat, longitude: coords.lng });
    }
  };

  const handleSelectDestination = async (place) => {
    setDestinationText(place.description);
    setDestinationSuggestions([]);

    const coords = await getCoordinatesFromPlaceID(place.place_id);
    if (coords) {
      setDestination({ latitude: coords.lat, longitude: coords.lng });
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

  return (
    <View style={styles.container}>
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
      >
        {origin && <Marker coordinate={origin} title="Current Location" />}
        {destination && <Marker coordinate={destination} title="Destination" />}
        {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />}
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
});

export default NavigationMap;




