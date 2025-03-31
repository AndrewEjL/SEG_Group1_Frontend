import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// This is a simplified web version of the MapView component
// In a real implementation, you would use a web mapping library like Leaflet or Google Maps

const MapView = ({ style, children, region, ...props }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.notice}>
        Map View - In browser version, this would show an interactive map.
      </Text>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>
          {region ? `Centered at: ${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}` : 'Map would appear here'}
        </Text>
        {children}
      </View>
    </View>
  );
};

MapView.Marker = ({ coordinate, title, description }) => (
  <View style={styles.marker}>
    <Text style={styles.markerTitle}>{title || 'Marker'}</Text>
    {description && <Text style={styles.markerDesc}>{description}</Text>}
    <Text style={styles.markerCoord}>
      {coordinate ? `(${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)})` : ''}
    </Text>
  </View>
);

MapView.Polyline = ({ coordinates }) => (
  <View style={styles.polyline}>
    <Text style={styles.polylineText}>
      Route with {coordinates ? coordinates.length : 0} points
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  notice: {
    backgroundColor: '#4285F4',
    color: 'white',
    padding: 8,
    textAlign: 'center',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  mapText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
  },
  marker: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  markerTitle: {
    fontWeight: 'bold',
  },
  markerDesc: {
    fontSize: 12,
    color: '#666',
  },
  markerCoord: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  polyline: {
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    borderRadius: 4,
    padding: 8,
    margin: 8,
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  polylineText: {
    fontSize: 12,
    color: '#4285F4',
  },
});

export default MapView; 