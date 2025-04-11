import React, { useState, useMemo } from "react";
import { View, ScrollView, Text, StyleSheet, Dimensions, Alert ,Modal, TouchableOpacity} from "react-native";
import { TextInput, Button, HelperText ,Checkbox} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useUser } from "../../contexts/UserContext";

const { width, height } = Dimensions.get("window");

const ClientRegistration = ({ navigation }) => {
  const { register } = useUser();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError,setConfirmPasswordError]=useState("");
  const [checked, setChecked] = useState(false);
  const [uncheckedError, setUncheckedError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

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
    }else {
        setPasswordError("");
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    } else {
      setConfirmPasswordError("");
    }

    if (!checked) {
        setUncheckedError("Please check the terms and conditions and accept before submitting your registration.");
        return;
    } else {
        setUncheckedError("");
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

  const handleAcceptTnC = () => {
      setChecked(true);
      setModalVisible(false);
  }


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
        secureTextEntry={!passwordVisible}
        right={
          <TextInput.Icon
            icon={passwordVisible ? "eye-off" : "eye"}
            onPress={() => setPasswordVisible(!passwordVisible)}
          />
        }
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
        secureTextEntry={!confirmPasswordVisible}
        right={
          <TextInput.Icon
            icon={confirmPasswordVisible ? "eye-off" : "eye"}
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          />
        }
        style={styles.input}
        error={confirmPasswordError !== ""}
      />
      {confirmPasswordError ? (
        <HelperText type="error" style={styles.helperText}>
          <Icon name="error-outline" size={width * 0.03} color="red" /> {confirmPasswordError}
        </HelperText>
      ) : null}

      <View style={styles.termsRow}>
        <Checkbox
          status={checked ? 'checked' : 'unchecked'}
          onPress={() => setChecked(!checked)}
        />
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.termsText}>
            I agree to the Terms and Conditions.
          </Text>
        </TouchableOpacity>
      </View>
      { uncheckedError ? (
        <HelperText type="error" style={styles.helperText2}>
          <Icon name="error-outline" size={width * 0.03} color="red" /> {uncheckedError}
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
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ alignSelf: "flex-start" }}>
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Terms & Conditions </Text>
              <ScrollView style={styles.modalScrollView}>
              <Text style={styles.modalText}>
                <Text style={styles.modalSubTitle}>Non-Retrievable E-Waste Policy{"\n"}</Text>

                {"\n"}By using this application and its e-waste collection services, you agree to the following condition:{"\n\n"}

                1) Once the e-waste has been collected by the assigned recycling facility, all items are deemed non-retrievable.{"\n\n"}

                2) Clients will not be able to request the return of any collected e-waste under any circumstances.{"\n\n"}
                All collected items will be handled in accordance with authorized recycling procedures.
              </Text>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={handleAcceptTnC}
                >
                  <Text style={styles.acceptText}>accept</Text>
                </TouchableOpacity>
              </ScrollView>
          </View>
        </View>
      </Modal>
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
  helperText2: {
    alignSelf: "flex-start",
    marginLeft: "5%",
    color: "#f20a0a",
    fontSize: width * 0.03,
    marginTop: -5,
  },
 termsRow: {
   flexDirection: "row",
   alignItems: "center",
   width: "80%",
   marginTop: 5,
 },
 termsText: {
   color: "#007bff",
   textDecorationLine: "underline",
 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },

  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333333",
  },
  modalSubTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333333",
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
    color: "#333333",
  },
  modalScrollView: {
      width: '100%',
      maxHeight: '90%',
      paddingTop: 30,
  },
  acceptButton: {
    backgroundColor: "#5E4DCD",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 40,
  },
  acceptText: {
    color: "white",
    fontWeight: "bold",
  },


});

export default ClientRegistration;

