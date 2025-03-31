// This file contains web-specific implementations of native modules

// Polyfill for react-native-maps
if (typeof window !== 'undefined') {
  window.MAPBOX_ACCESS_TOKEN = '';
  window.MapboxGL = {
    setAccessToken: () => {},
  };
} 