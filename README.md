# SEG Group1 Frontend - OpenStreetMap Integration

## 📱 Try the App

### Download APK for Android
You can download and install the app directly on your Android device:

1. Download the APK from the link provided in the https://github.com/AndrewEjL/SEG_Group1_Frontend/releases/tag/v0.2

## 💼 For Potential Employers

This project demonstrates several technical skills and competencies valuable in software development:

- **Cross-Platform Mobile Development**: Built with React Native for both iOS and Android platforms
- **TypeScript Integration**: Strong typing system for catching errors early and enhancing code quality
- **Geospatial Programming**: Integration with mapping and routing services (OpenStreetMap, OSRM)
- **API Integration**: Geocoding, routing, and address lookup via RESTful API calls
- **State Management**: Using React Context API for global state management
- **UI/UX Design**: Creating intuitive, responsive mobile interfaces
- **Authentication Flow**: Implementation of login/registration systems


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

## Test Accounts

You can use the following test accounts to explore different aspects of the application:

### Regular User
- **Email**: test@example.com
- **Password**: password

### Organization User
- **Email**: org@example.com
- **Password**: password 

## Features

- **User-side features**:
  - List electronic waste items for pickup
  - Track the status of your listed items
  - View history of previous recycling activity
  - Manage your user profile and account settings

- **Organization-side features**:
  - View available items for pickup
  - Schedule and manage pickups
  - Assign collectors to routes
  - Process and track e-waste collection

- **Collector features**:
  - View optimized pickup routes
  - Navigate between pickup locations
  - Mark pickups as complete

## Technical Information

- Built with React Native and TypeScript
- Uses React Navigation for navigation
- Incorporates OpenStreetMap and OSRM for mapping and routing
- Implements Context API for state management

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
