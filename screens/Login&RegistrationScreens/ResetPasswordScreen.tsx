import React, { useState , useMemo} from "react";
import { View, ScrollView, Text, StyleSheet, Dimensions, Alert ,Modal, TouchableOpacity} from "react-native";
import { TextInput, Button, HelperText ,Checkbox} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { resetPassword } from "../api/user/resetPassword";
import { resetOrgPassword } from "../api/organization/resetOrgPassword";

const { width, height } = Dimensions.get("window");

const ResetPassword = ({ route,navigation }) => {

  const email = route?.params?.email || "";
  const userTypeV = route?.params?.userTypeV || "";
  console.log(userTypeV)
  console.log(email)

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError,setConfirmPasswordError]=useState("");
  const [isLoading, setIsLoading] = useState(false);

const isFormValid = useMemo(() => {
  return (
    password.trim() !== "" &&
    confirmPassword.trim() !== ""
  );
}, [password, confirmPassword]);


const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;//valid email format
    const passwordRegex = /^(?=.*[0-9])(?=.*[\W_]).{8,}$/;// at least 8 characters, including a number and a special character.
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
    setIsLoading(true);
    try {
      // Call the register function from UserContext
      if(userTypeV == "user"){
        const success = await resetPassword(email, password);
        if(success){
          Alert.alert("Success", "Your account password has been updated, you may login now");
        }
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else if(userTypeV == "organization"){
        const success = await resetOrgPassword(email, password);
        if(success){
          Alert.alert("Success", "Your account password has been updated, you may login now");
        }
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error("Updated password error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }

}



return (
    <View
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Text style={styles.title}>New Password</Text>
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

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.nextButton}
        disabled={!isFormValid || isLoading}
        loading={isLoading}
      >
        Submit
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

});
export default ResetPassword;