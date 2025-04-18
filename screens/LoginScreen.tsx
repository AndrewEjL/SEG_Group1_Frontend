import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { TextInput } from 'react-native-paper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { login } from './api/login';
import AsyncStorage from "@react-native-async-storage/async-storage";

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<any, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  // useEffect(() => {
  //   if (user) {
  //     if (user.role === 'organization') {
  //       navigation.navigate('RHome');
  //     } else {
  //       navigation.navigate('Home');
  //     }
  //   }
  // }, [user, navigation]);

  const handleSignIn = async () => {
      if (!email || !password) {
          setError('Please enter both email and password');
          return;
      }

      setError('');
      setIsLoading(true);

      try {
          const result = await login(email, password);

          if (result.success) {
              await AsyncStorage.setItem("id", String(result.id));

              if (result.userType === "donor") {
                  navigation.navigate('Home', { id: result.id, userType: result.userType });
              } else if (result.userType === "recipient") {
                  navigation.navigate("CLHome", {id: result.id, userType: result.userType});
              } else if (result.userType === "organization") {
                  navigation.navigate('RHome', {id: result.id, userType: result.userType});
              }
          } else {
            console.log(result)
            setError('Invalid email or password');
          }
      } catch (err) {
          setError('An error occurred during login');
      } finally {
          setIsLoading(false);
      }
  };



  const handleSignUp = () => {
    navigation.navigate('SelectRegistrationRole');
  };
  const handleForgotPassword = () => {
    navigation.navigate('forgotPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.loginCard}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome Back!</Text>
              <Text style={styles.subtitleText}>Sign in to your account to continue</Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { color: '#000' }]}
                mode="outlined"
                label="Email"
                placeholder="Email"
                placeholderTextColor="#9e9e9e"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />

              <TextInput
                style={[styles.input, { color: '#000' }]}
                mode="outlined"
                label="Password"
                placeholder="Password"
                placeholderTextColor="#9e9e9e"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry={!passwordVisible}
                editable={!isLoading}
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? "eye-off" : "eye"}
                    onPress={() => setPasswordVisible(!passwordVisible)}
                  />
                }
              />
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <TouchableOpacity 
              style={[styles.signInButton, isLoading && styles.signInButtonDisabled]} 
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signInButtonText}>Sign in</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>New User? </Text>
              <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
                <Text style={[styles.signUpLink, isLoading && styles.signUpLinkDisabled]}>
                  Sign up!
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
                <Text style={[styles.forgotPasswordLink, isLoading && styles.forgotPasswordDisabled]}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: "100%",
    paddingVertical: 20,
  },
  loginCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'stretch',
    paddingVertical: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitleText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: '#5E4DCD',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpText: {
    color: '#000',
    fontSize: 16,
  },
  signUpLink: {
    color: '#5E4DCD',
    fontWeight: '600',
    fontSize: 16,
  },
  signUpLinkDisabled: {
    opacity: 0.7,
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#000',
    fontSize: 16,
  },
  forgotPasswordLink: {
    color: '#5E4DCD',
    fontWeight: '600',
    fontSize: 16,
  },
  forgotPasswordDisabled: {
    opacity: 0.7,
  },
});

export default LoginScreen; 