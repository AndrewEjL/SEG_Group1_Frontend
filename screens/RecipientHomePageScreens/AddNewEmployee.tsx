import React, { useState, useMemo } from "react";
import { View, ScrollView, Text, StyleSheet, Dimensions, Alert } from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useUser } from "../../contexts/UserContext";

const { width, height } = Dimensions.get("window");

const ClientRegistration = ({ navigation }) => {
  const { register } = useUser();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError,setConfirmPasswordError]=useState("");
  const [isLoading, setIsLoading] = useState(false);

const isFormValid = useMemo(() => {
  return (
    username.trim() !== "" &&
    email.trim() !== "" &&
    phoneNumber.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== ""
  );
}, [username, email, phoneNumber, password, confirmPassword]);

  const handleSubmit = async () => {
    const existingEmails = ["test@example.com", "user@gmail.com"];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;//valid email format
    const passwordRegex = /^(?=.*[0-9])(?=.*[\W_]).{8,}$/;// at least 8 characters, including a number and a special character.

    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format.");
      return;
    }
    if (existingEmails.includes(email)) {
      setEmailError("Email is already in use.");
      return;
    } else {
      setEmailError("");
    }
    if (!passwordRegex.test(password)) {
        setPasswordError("Password must be at least 8 characters long and include a number and a special character.");
        return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    } else {
      setConfirmPasswordError("");
    }

    setIsLoading(true);
    try {
      // Call the register function from UserContext
      const success = await register(username, email, password, phoneNumber);
      
      if (success) {
        Alert.alert("Success", "Your account has been registered, you may login now.");
        navigation.navigate("Login");
      } else {
        Alert.alert("Error", "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Text style={styles.title}>Enter your profile</Text>
      <TextInput
        label="User Name"
        mode="outlined"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        error={emailError !== ""}
      />
      {emailError !== "" && (
        <HelperText type="error" style={styles.helperText}>
          <Icon name="error-outline" size={width * 0.03} color="red" /> {emailError}
        </HelperText>
      )}

      <TextInput
        label="Phone Number"
        mode="outlined"
        value={`+60${phoneNumber}`}
        onChangeText={(text) => {
          if (!text.startsWith("+60")) {
            text = "+60";
          }
          const numberOnly = text.slice(3).replace(/\D/g, "");
          setPhoneNumber(numberOnly);
        }}
        style={styles.input}
      />

      <TextInput
        label="Password"
        mode="outlined"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        error={passwordError !== ""}
      />
      <HelperText
        type={passwordError ? "error" : "info"}
        style={[styles.helperText, { color: passwordError ? "red" : "blue" }]}
      >
        <Icon
          name={passwordError ? "error-outline" : "info-outline"}
          size={width * 0.03}
          color={passwordError ? "red" : "blue"}
        />{" "}
        {passwordError ? passwordError : "At least 8 characters, including a number and a special character."}
      </HelperText>

      <TextInput
        label="Confirm password"
        mode="outlined"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
        error={confirmPasswordError !== ""}
      />
      {confirmPasswordError ? (
        <HelperText type="error" style={styles.helperText}>
          <Icon name="error-outline" size={width * 0.03} color="red" /> {confirmPasswordError}
        </HelperText>
      ) : null}

      <Button 
        mode="contained" 
        onPress={handleSubmit} 
        style={styles.nextButton} 
        disabled={!isFormValid || isLoading}
        loading={isLoading}
      >
        Submit
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingTop: height * 0.03,
    paddingBottom: height * 0.1,
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginBottom: height * 0.08,
    color: "#0a0a0a",
  },
  input: {
    width: "80%",
    backgroundColor: "white",
    marginBottom: height * 0.05,
  },
  nextButton: {
    width: "50%",
    maxWidth: 400,
    marginTop: 40,
  },
  helperText: {
    alignSelf: "flex-start",
    marginLeft: "5%",
    color: "#f20a0a",
    fontSize: width * 0.03,
    marginTop: -40,
  },

});

export default ClientRegistration;

