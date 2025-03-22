import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Dropdown } from "react-native-element-dropdown";
import { Checkbox } from "react-native-paper";

const EWasteTypes = [
  { type: 'Select Type', selected: false },
  { type: 'Smartphone', selected: false },
  { type: 'Tablet', selected: false },
  { type: 'Laptop', selected: false },
  { type: 'Desktop Computer', selected: false },
  { type: 'Monitor', selected: false },
  { type: 'Printer', selected: false },
  { type: 'Gaming Console', selected: false },
  { type: 'TV', selected: false }
];

const RProfileScreen = ({ navigation }) => {
  const handleTabPress = (screen) => {
    navigation.navigate(screen);
  };
const [user, setUser] = useState({
  organization: "Org Name",
  email: "text@example.com",
  address: "123 Main St, City",
  phoneNumber: "+601233335555",
  password: "test_1111",
});

const [modal1Visible, setModal1Visible] = useState(false);
const [modal2Visible, setModal2Visible] = useState(false);
const [modal3Visible, setModal3Visible] = useState(false);
const [modal4Visible, setModal4Visible] = useState(false);
const [tempUser, setTempUser] = useState(user);
const [tempPassword, setTempPassword] = useState({ originPassword: "", password: "", confirmPassword: "" })
const [errors, setErrors] = useState({ email: "", phoneNumber: "", address: "" });
const [passwordErrors, setPasswordErrors] = useState({ originPassword: "", password: "", confirmPassword: "" });

const [selectedState, setSelectedState] = useState("State 1");
const [cities, setCities] = useState([]);

const states = ["State 1", "State 2", "State 3"];
const stateCities = {
  "State 1": [{ name: "City 1", selected: false }, { name: "City 2", selected: false }],
  "State 2": [{ name: "City 3", selected: false }, { name: "City 4", selected: false }],
  "State 3": [{ name: "City 5", selected: false }, { name: "City 6", selected: false }],
};


const [ewasteTypes, setEWasteTypes] = useState(EWasteTypes);
const [tempEWasteTypes, setTempEWasteTypes] = useState(ewasteTypes);

const handleStateChange = (newState) => {
  setSelectedState(newState);
  setCities(stateCities[newState] || []);
};

  const handleEWasteTypeChange = (type) => {
    setEWasteTypes((prevTypes) => {
      return prevTypes.map((item) => {
        if (item.type === type) {
          return { ...item, selected: !item.selected };
        }
        return item;
      });
    });
  };


const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const handlePhoneNumberChange = (text) => {
  if (!text.startsWith("+60")) {
    text = "+60" + text.replace(/[^0-9]/g, "");
  } else {
    text = text.replace(/[^0-9+]/g, "");
  }
  setTempUser((prev) => ({ ...prev, phoneNumber: text }));
};

const validateAddress = () => {
  return tempUser.address.trim().length > 0;
};

const handleSave = () => {
  let newErrors = { email: "", phoneNumber: "", address: "" };

  if (!validateEmail(tempUser.email)) {
    newErrors.email = "Invalid email format";
  }
  if (!tempUser.phoneNumber.startsWith("+60") || tempUser.phoneNumber.length < 10) {
    newErrors.phoneNumber = "Phone number must start with +60 and have at least 10 digits";
  }
  if (!validateAddress()) {
    newErrors.address = "Address cannot be empty";
  }

  setErrors(newErrors);

  if (!newErrors.email && !newErrors.phoneNumber && !newErrors.address) {
    setUser(tempUser);
    setModal1Visible(false);
    Alert.alert("Success", "Profile updated successfully!");
  }
};

const handleChangePassword = () => {
  let newErrors = { originPassword: "", password: "", confirmPassword: "" };

  if (tempPassword.originPassword !== user.password) {
    newErrors.originPassword = "Incorrect original password";
  }

  const passwordRegex = /^(?=.*[0-9])(?=.*[\W_]).{8,}$/;

  if (!tempPassword.password) {
    newErrors.password = "New password cannot be empty";
  } else if (!passwordRegex.test(tempPassword.password)) {
    newErrors.password = "Password must be at least 8 characters long, containing at least one number and one special character";
  }

  if (tempPassword.confirmPassword !== tempPassword.password) {
    newErrors.confirmPassword = "Confirm password does not match new password";
  }

  setPasswordErrors(newErrors);

  if (!newErrors.originPassword && !newErrors.password && !newErrors.confirmPassword) {
    setUser((prevUser) => ({
      ...prevUser,
      password: tempPassword.password,
    }));
    setTempPassword({ originPassword: "", password: "", confirmPassword: "" });
    setModal2Visible(false);
    Alert.alert("Success", "Password changed successfully!");
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Icon name="account-circle" size={60} color="#a393eb" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{user.organization}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => setModal1Visible(true)}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account management</Text>
        <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate("CollectorList")}>
          <Icon name="clipboard-list" size={20} color="#5E4DCD" />
          <Text style={styles.listText}>Collector list</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem} onPress={() => setModal2Visible(true)}>
          <Icon name="key" size={20} color="#5E4DCD" />
          <Text style={styles.listText}>Change password</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <TouchableOpacity style={styles.listItem}>
          <Icon name="chart-pie" size={20} color="#5E4DCD" />
          <Text style={styles.listText}>Recycling Volume Statistics</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customization</Text>
        <TouchableOpacity style={styles.listItem} onPress={()=> setModal3Visible(true)}>
          <Icon name="map" size={20} color="#5E4DCD" />
          <Text style={styles.listText}>Service area</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem} onPress={()=> setModal4Visible(true)}>
          <Icon name="chip" size={20} color="#5E4DCD" />
          <Text style={styles.listText}>E-waste type</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("home")}>
          <Icon name="home" size={24} color="#5E4DCD" />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("rewards")}>
          <Icon name="package-variant" size={24} color="#666" />
          <Text style={styles.navText}>Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("profile")}>
          <Icon name="account" size={24} color="#666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modal1Visible}
        onRequestClose={() => setModal1Visible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setModal1Visible(false)} style={{ alignSelf: "flex-start" }}>
                <Icon name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={tempUser.email}
              onChangeText={(text) => setTempUser({ ...tempUser, email: text })}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={tempUser.phoneNumber}
              onChangeText={handlePhoneNumberChange}
            />
            {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={tempUser.address}
              onChangeText={(text) => setTempUser({ ...tempUser, address: text })}
            />
            {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
         animationType="slide"
         transparent={true}
         visible={modal2Visible}
         onRequestClose={() => setModal2Visible(false)}
       >
         <View style={styles.modalContainer}>
           <View style={styles.modalContent}>
             <TouchableOpacity onPress={() => setModal2Visible(false)} style={{ alignSelf: "flex-start" }}>
                 <Icon name="close" size={24} color="black" />
             </TouchableOpacity>
             <Text style={styles.modalTitle}>Change password</Text>
             <TextInput
               placeholder="Origin Password"
               value={tempPassword.originPassword}
               onChangeText={(text) => setTempPassword({ ...tempPassword, originPassword: text })}
               secureTextEntry
               style={styles.input}
             />
             {passwordErrors.originPassword ? <Text style={styles.errorText}>{passwordErrors.originPassword}</Text> : null}
             <TextInput
               placeholder="New Password"
               value={tempPassword.password}
               onChangeText={(text) => setTempPassword({ ...tempPassword, password: text })}
               secureTextEntry
               style={styles.input}
             />
             {passwordErrors.password ? <Text style={styles.errorText}>{passwordErrors.password}</Text> : null}
             <TextInput
               placeholder="Confirm new Password"
               value={tempPassword.confirmPassword}
               onChangeText={(text) => setTempPassword({ ...tempPassword, confirmPassword: text })}
               secureTextEntry
               style={styles.input}
             />
             {passwordErrors.confirmPassword ? <Text style={styles.errorText}>{passwordErrors.confirmPassword}</Text> : null}
             <View style={styles.modalButtons}>
               <TouchableOpacity
                 style={styles.saveButton}
                 onPress={handleChangePassword}
               >
                 <Text style={styles.buttonText}>Save</Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </Modal>
       <Modal
         animationType="slide"
         transparent={true}
         visible={modal3Visible}
         onRequestClose={() => setModal3Visible(false)}
       >
         <View style={styles.modalContainer}>
           <View style={styles.modalContent}>
             <TouchableOpacity onPress={() => {setModal3Visible(false); Alert.alert("Success", "Service area updated!");}} style={{ alignSelf: "flex-start" }}>
               <Icon name="close" size={24} color="black" />
             </TouchableOpacity>
             <Text style={styles.modalTitle}>Select Service Area</Text>

             <Dropdown
               style={styles.dropdown}
               placeholderStyle={styles.placeholderStyle}
               selectedTextStyle={styles.selectedTextStyle}
               inputSearchStyle={styles.inputSearchStyle}
               itemTextStyle={styles.itemTextStyle}
               data={states.map((state) => ({ label: state, value: state }))}
               labelField="label"
               valueField="value"
               value={selectedState}
               onChange={(item) => handleStateChange(item.value)}
               placeholder="Select a state"
             />

             <Text style={styles.modalTitle}>Select Cities</Text>
             {cities.map((city, index) => (
               <TouchableOpacity key={index} style={styles.checkboxContainer} onPress={() => {
                 setCities(cities.map((c, i) => i === index ? { ...c, selected: !c.selected } : c));
               }}>
                 <Checkbox status={city.selected ? "checked" : "unchecked"} />
                 <Text style={styles.checkboxLabel}>{city.name}</Text>
               </TouchableOpacity>
             ))}
           </View>
         </View>
       </Modal>
       <Modal
         animationType="slide"
         transparent={true}
         visible={modal4Visible}
         onRequestClose={() => setModal4Visible(false)}
       >
         <View style={styles.modalContainer}>
           <View style={styles.modalContent}>
             <TouchableOpacity onPress={() => {setModal4Visible(false);Alert.alert("Success", "E-waste types updated!");}} style={{ alignSelf: "flex-start" }}>
               <Icon name="close" size={24} color="black" />
             </TouchableOpacity>
             <Text style={styles.modalTitle}>Specify e-waste type</Text>
             {ewasteTypes.slice(1).map((item, index) => (
              <View key={index} style={styles.checkboxContainer}>
                <Checkbox
                  status={item.selected ? 'checked' : 'unchecked'}
                  onPress={() => handleEWasteTypeChange(item.type)}
                />
                <Text style={styles.checkboxText}>{item.type}</Text>
              </View>
            ))}
           </View>
         </View>
       </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EBF8",
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 40,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e5ddff",
    marginBottom: 10,
    marginTop:20,
    marginLeft: 10,
  },
  userInfo: {
    flex: 1,
    padding:20,
    justifyContent: "center",
  },
  username: { fontSize: 18, fontWeight: "bold" },
  email: { fontSize: 14, color: "#666", marginBottom: 10 },
  editProfileButton: { backgroundColor: "#5E4DCD", paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20,width:"70%" , alignItems: "center",},
  editProfileText: { color: "#fff", fontWeight: "bold" },
  section: { marginBottom: 20, backgroundColor: "#f9f9f9", borderRadius: 10, padding: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#666", marginBottom: 5 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  listText: { fontSize: 14, marginLeft: 10, color: "#333" },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  activeNavText: {
    color: "#5E4DCD",
  },
modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 30, color: "black",marginTop: 20, },
  input: {
    width: "97%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 30,
  },
  saveButton: {
    backgroundColor: "#5E4DCD",
    padding: 10,
    borderRadius: 20,
    width: "40%",
    alignItems: "center",
    marginRight: 5,

  },

  buttonText: { color: "#fff", fontWeight: "bold" },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
 dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 5,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 16,
  },
  itemTextStyle: {
    color: "#000",
    fontSize: 16,
  },
  placeholderStyle: {
    color: "#161717",
    fontSize: 16,
  },
  selectedTextStyle: {
    color: "#2645f0",
    fontSize: 16,
  },
  inputSearchStyle: {
    color: "#000",
    fontSize: 14,
  },

});

export default RProfileScreen;
