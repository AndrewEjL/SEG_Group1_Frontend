import React, { useState } from "react";
import { View, ScrollView, Text, StyleSheet, Dimensions, Alert ,Modal, TouchableOpacity} from "react-native";
import { TextInput, Button, HelperText ,Checkbox} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { generateCode } from "../api/user/generateCode";
import { useClientVerify } from "../api/user/getForgotPassVerify";
import { useOrgVerify } from "../api/organization/getOrgForgotPassVerify";

const { width, height } = Dimensions.get("window");

const codeVerification = ({ route,navigation }) => {
  const { verifyEmailCode, loading, error, success } = useClientVerify();
  const { verifyOrgEmailCode, loading: loadingOrg, error:Org, success:org } = useOrgVerify();
  const { generate1Code, loading: loading1Code } = generateCode();

const email = route?.params?.email || "";
const initialCode = route?.params?.verifyCode || "";
const userTypeV = route?.params?.userType || "";
const [verificationCode, setVerificationCode] = useState(initialCode);

const [input, setInput] = useState("");
const [inputError, setInputError] = useState("");
const [isLoading, setIsLoading] = useState(false);



const handleSubmit = () => {
    if(verificationCode == input){
        navigation.reset({
          index: 1,
          routes: [{ name: 'Login' }, { name: 'ResetPassword', params: {email, userTypeV} }],
        });
    }else{
        setInputError("Incorrect verification code ")
    }
}

const resendVerificationCode = async () => {
  try {
    const newCode = generate1Code.code;
    setVerificationCode(newCode);
    console.log("user: ",userTypeV)
    if(userTypeV == "user"){
      const send = await verifyEmailCode(email, newCode);
    } else if(userTypeV === "organization"){
      const sendOrg = await verifyOrgEmailCode(email, newCode);
    }
  } catch (err) {
    console.error("Resend error:", err);
    Alert.alert("Error", "Something went wrong.");
  }
};


return (
    <View
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Text style={styles.title}>Enter the verification code</Text>
      <TextInput
        label="Verification code"
        mode="outlined"
        value={input}
        onChangeText={setInput}
        style={styles.input}
      />
      {inputError ? (
        <HelperText type="error" style={styles.helperText}>
          <Icon name="error-outline" size={width * 0.03} color="red" /> {inputError}
        </HelperText>
      ) : null}

      <View style={styles.resendContainer}>
         <Text style={styles.resendText}>Didn't receive code? </Text>
         <TouchableOpacity onPress={resendVerificationCode} disabled={isLoading}>
           <Text style={[styles.resendLink, isLoading && styles.resendDisabled]}>
                  Resend
           </Text>
         </TouchableOpacity>
      </View>
      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.nextButton}
        disabled={!input || isLoading}
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
export default codeVerification;