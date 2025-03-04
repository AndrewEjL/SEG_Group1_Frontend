import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RLoginScreen from './screens/RecipientScreens/RLoginScreen.tsx';
import RRegistrationScreen1 from './screens/RecipientScreens/RRegistrationScreen1.tsx'
import RRegistrationScreen2 from './screens/RecipientScreens/RRegistrationScreen2.tsx'
import RRegistrationScreen3 from './screens/RecipientScreens/RRegistrationScreen3.tsx'

// Define your navigation types
type RootStackParamList = {
  'Login Options': undefined;
  Login: undefined;
  CreateAccount: undefined;
};

// Type for navigation prop
type LoginOptionsProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login Options'>;
};

// Page 2 Component (You can work on this)
const RegisterScreen = () => {
  return (
    <View style={styles.pageContainer}>
      <Text style={styles.pageTitle}>Page 2</Text>
      <Text style={styles.pageDescription}>
        This is Page 2. You can replace this with your UI components.
      </Text>
    </View>
  );
};

// Main Home Screen with Navigation Buttons
const LoginOptions = ({ navigation }: LoginOptionsProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>E-Waste Management</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('CreateAccount')}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('RecipientLogin')}
        >
          <Text style={styles.buttonText}>Login As Recipient</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Create the navigation stack
const Stack = createNativeStackNavigator<RootStackParamList>();

// Main App Component with Navigation
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login Options">
        <Stack.Screen
          name="Login Options"
          component={LoginOptions}
          options={{ title: 'Login Options' }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Login' }}
        />
        <Stack.Screen
          name="CreateAccount"
          component={RegisterScreen}
          options={{ title: 'Create Account' }}
        />
        <Stack.Screen
          name="RecipientLogin"
          component={RLoginScreen}
          options={{ title: 'Login as recipient' }}
        />
        <Stack.Screen
          name="RecipientSelectRole"
          component={RRegistrationScreen1}
          options={{ title: 'Select role' }}
        />
        <Stack.Screen
          name="RecipientSignUp"
          component={RRegistrationScreen2}
          options={{ title: 'Sign Up' }}
        />
        <Stack.Screen
          name="CompanyInformationRequest"
          component={RRegistrationScreen3}
          options={{ title: 'Company Information' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  button: {
    backgroundColor: '#4263ec',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  pageContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  pageDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default App;