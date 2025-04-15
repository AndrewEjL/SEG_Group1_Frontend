import React, { useState } from "react";
import { View, ScrollView, Text, StyleSheet, Dimensions, Alert ,Modal, TouchableOpacity} from "react-native";
import { TextInput, Button, HelperText ,Checkbox} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");

const forgotPassword = ({ navigation }) => {

const existingEmails = ["test@example.com", "user123@gmail.com"];

const [email, setEmail] = useState("");
const [emailError, setEmailError] = useState("");
const [isLoading, setIsLoading] = useState(false);



const handleSend = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;//valid email format

    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format.");
      return;
    }
   if (!existingEmails.includes(email)) {
      setEmailError("This email is not registered.");
      return;
   }else{
       setEmailError("");
       navigation.navigate("CodeVerification", { email });
   }
}


return (
    <View
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Text style={styles.title}>Enter your email address</Text>
      <TextInput
        label="Enter your email address"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      {emailError ? (
        <HelperText type="error" style={styles.helperText}>
          <Icon name="error-outline" size={width * 0.03} color="red" /> {emailError}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={handleSend}
        style={styles.nextButton}
        disabled={!email || isLoading}
        loading={isLoading}
      >
        Send Verification code
      </Button>
    </View>
)
}
const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingTop: height * 0.03,
    paddingBottom: height * 0.1,
    height:"100%",
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resendText: {
    color: '#000',
    fontSize: 16,
  },
  resendLink: {
    color: '#5E4DCD',
    fontWeight: '600',
    fontSize: 16,
  },
  resendLinkDisabled: {
    opacity: 0.7,
  },
});
export default forgotPassword;