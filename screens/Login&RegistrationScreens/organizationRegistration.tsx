import React, { useState } from "react";
import { View,ScrollView, Text, StyleSheet, Dimensions, Alert } from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");

const registrationTypes = [
  { label: "Company Registration Number Old", value: "company_old" },
  { label: "Business Registration Number Old", value: "business_old" },
  { label: "Company Registration Number New", value: "company_new" },
  { label: "Business Registration Number New", value: "business_new" },
  { label: "LLP Registration Number", value: "llp" },
];

const OrgRegistration = ({ navigation }) => {
  const [orgName, setOrgName] = useState("");
  const [businessType, setBusinessType] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [brn, setBrn] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailError, setEmailError] = useState("");
  const [brnError, setBrnError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");

  const isFormValid =
    orgName.trim() !== "" &&
    businessType !== null &&
    brn.trim() !== "" &&
    address.trim() !== "" &&
    email.trim() !== "" &&
    phoneNumber.trim() !== ""

const handleSubmit = async () => {
  // Dummy data
  const existingEmails = ["test@example.com", "user@gmail.com"];
  const existingBrns = ["123456789", "987654321"];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let hasError = false;

  // Email format check
  if (!emailRegex.test(email)) {
    setEmailError("Invalid email format.");
    hasError = true;
  } else if (existingEmails.includes(email)) {
    setEmailError("Email is already in use.");
    hasError = true;
  } else {
    setEmailError("");
  }

  // BRN check
  if (existingBrns.includes(brn)) {
    setBrnError("This Business registration number is already registered.");
    hasError = true;
  } else {
    setBrnError("");
  }
  if (phoneNumber.length < 8) {
    setPhoneNumberError("Phone number must start with +60 and have at least 10 digits");
    hasError = true;
  } else {
    setPhoneNumberError("");
  }

  // Navigation if no errors
  if (!hasError) {
    navigation.navigate("OrgRegistrationCompleted");
  }
};



  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Text style={styles.title}>Enter your company profile</Text>

      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        itemTextStyle={styles.itemTextStyle}
        iconStyle={styles.iconStyle}
        data={registrationTypes}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? "Select Your Registration Type" : "..."}
        searchPlaceholder="Search..."
        value={businessType}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setBusinessType(item.value);
          setIsFocus(false);
        }}
      />

      <TextInput
        label="Organization name"
        mode="outlined"
        value={orgName}
        onChangeText={setOrgName}
        style={styles.input}
      />

      <TextInput
        label="Business Register Number"
        mode="outlined"
        value={brn}
        onChangeText={setBrn}
        style={styles.input}
        error={brnError !== ""}
      />
      {brnError !== "" && (
        <HelperText type="error" style={styles.helperText}>
          <Icon name="error-outline" size={width * 0.03} color="red" /> {brnError}
        </HelperText>
      )}

      <TextInput
        label="Registered Address"
        mode="outlined"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
        multiline={true}
        numberOfLines={4}
      />

      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        error={emailError !== ""}
      />
      {emailError ? (
        <HelperText type="error" style={styles.helperText}>
          <Icon name="error-outline" size={width * 0.03} color="red" /> {emailError}
        </HelperText>
      ) : (
        <HelperText type="info" style={styles.hintText}>
          <Icon name="info-outline" size={width * 0.03} color="blue" /> The registration result will be sent to this email address.
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
        keyboardType="numeric"
        style={styles.input}
        error={phoneNumberError !== ""}
      />
      {phoneNumberError !== "" && (
        <HelperText type="error" style={styles.helperText}>
          <Icon name="error-outline" size={width * 0.03} color="red" /> {phoneNumberError}
        </HelperText>
      )}

      <Button mode="contained" onPress={handleSubmit} style={styles.nextButton} disabled={!isFormValid}>
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
  dropdown: {
    height: height * 0.06,
    width: "80%",
    borderColor: "#0a0a0a",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "white",
    marginBottom: height * 0.05,
  },
  itemTextStyle: {
    color: "#000",
    fontSize: width * 0.04,
  },
  placeholderStyle: {
    color: "#161717",
    fontSize: width * 0.04,
  },
  selectedTextStyle: {
    color: "#2645f0",
    fontSize: width * 0.04,
  },
  inputSearchStyle: {
    color: "#000",
    fontSize: 14,
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
  hintText:{
    alignSelf: "flex-start",
    marginLeft: "6%",
    color: "blue",
    fontSize: width * 0.03,
    marginTop: -40,
  }
});

export default OrgRegistration;


