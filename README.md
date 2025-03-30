# SEG Group1 Frontend - OpenStreetMap Integration

## Google Maps to OpenStreetMap Migration

This project has been updated to use OpenStreetMap instead of Google Maps API for all mapping functionality. The migration provides the following benefits:

- **Free and open-source**: No API keys or payment required
- **No expiration**: Will not expire or require renewal
- **Full routing capabilities**: Supports routing between locations through OSRM
- **Geocoding**: Address lookup and reverse geocoding through Nominatim

## Implementation Details

### Map Components

The following components have been updated to use OpenStreetMap:

1. **MapScreen.tsx**: Main map component for selecting a location
2. **NavigationMap.tsx**: Component for routing between locations 
3. **SelectLocation.tsx**: Simplified location selection component

### Technologies Used

- **react-native-maps** with `PROVIDER_DEFAULT`: For map display
- **Nominatim API**: For geocoding (converting addresses to coordinates and vice versa)
- **OSRM (Open Source Routing Machine)**: For calculating routes between locations
- **@mapbox/polyline**: For decoding route polylines

## Usage Notes

### Rate Limiting

Nominatim has a usage policy that includes rate limiting (1 request per second). Be mindful of this when making multiple requests in quick succession.

### Attribution

OpenStreetMap requires attribution when using their services. This has been added to all map components with:

```jsx
<View style={styles.attributionContainer}>
  <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
</View>
```

### User Agent

All requests to Nominatim include a User-Agent header as required by their usage policy:

```javascript
headers: {
  'Accept-Language': 'en',
  'User-Agent': 'SEG_Group1_Frontend/1.0'
}
```

## Future Improvements

- Add caching for geocoding results to reduce API calls
- Implement a fallback mechanism for when Nominatim is unavailable
- Consider hosting your own Nominatim instance for higher request volumes

## Resources

- [OpenStreetMap](https://www.openstreetmap.org/)
- [Nominatim Documentation](https://nominatim.org/release-docs/latest/)
- [OSRM API Documentation](http://project-osrm.org/docs/v5.5.1/api/)
- [Leaflet (alternative for web apps)](https://leafletjs.com/)
