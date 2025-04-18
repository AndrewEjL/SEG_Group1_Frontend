import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, Alert, ScrollView, SafeAreaView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MenuIcon from "react-native-vector-icons/MaterialIcons";
import { useUser } from '../../contexts/UserContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute } from "@react-navigation/native";
import { useCollector } from "../api/user/getCollector";
import { useAllOrganization } from "../api/organization/getAllOrg";
import { updateCollector } from "../api/user/updateCollectorProfile";
import { checkEmailExists } from "../api/organization/registerCollector";
import { validateCollectorPass } from "../api/user/validateCollectorPass";
import { updateCollectorPassword } from "../api/user/updateCollectorPassword";

type RootStackParamList = {
  CLHome: { id: number };
  CLProfile: { id:number };
  CLHistory: { id:number };
  Login: undefined;
};

type CLProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CLProfile'>;
};

const CLProfileScreen: React.FC<CLProfileScreenProps> = ({ navigation }) => {
  const route = useRoute();
  const {id} = route.params;
  console.log("Profile: "+id)
  const { displayCollector, loading: loadingCollector } = useCollector(id);
  const { displayAllOrg, loading: loadingAllOrg } = useAllOrganization();
  console.log(displayCollector)
  console.log(displayAllOrg)
  const { user, logout, changePassword, updateUserProfile } = useUser();

  const [tempUser, setTempUser] = useState({
    name: displayCollector?.user_name || "",
    email: displayCollector?.email || "",
    phoneNumber: displayCollector?.phone_number || ""
  });
  
  // Update temp user data when user object changes
  useEffect(() => {
    if (displayCollector) {
      setTempUser({
        name: displayCollector?.user_name,
        email: displayCollector?.email,
        phoneNumber: displayCollector?.phone_number
      });
    }
  }, [displayCollector]);

  const [tempPassword, setTempPassword] = useState({ originPassword: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ email: "", phoneNumber: "", address: "" });
  const [passwordErrors, setPasswordErrors] = useState({ originPassword: "", password: "", confirmPassword: "" });
  const [passwordVisibility, setPasswordVisibility] = useState({
    origin: false,
    new: false,
    confirm: false,
  });

  const [modal1Visible, setModal1Visible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);

  const getOrganizationName = (orgID: number) => {
    if(!orgID) return "No Organization";
    const orgName = displayAllOrg?.find((t) => t.organizationID === orgID)
    return orgName?.organization_name;
  }
  const clearModal2Data = () => {
    setTempPassword({ originPassword: "", password: "", confirmPassword: "" });
    setPasswordErrors({ originPassword: "", password: "", confirmPassword: "" });
    setPasswordVisibility({ origin: false, new: false, confirm: false });
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handlePhoneNumberChange = (text: string) => {
    if (!text.startsWith("+60")) {
      text = "+60" + text.replace(/[^0-9]/g, "");
    } else {
      text = text.replace(/[^0-9+]/g, "");
    }
    setTempUser((prev) => ({ ...prev, phoneNumber: text }));
  };

  const handleSave = async () => {
    let newErrors = { email: "", phoneNumber: "", address: "" };

    if(tempUser.email != displayCollector.email){
      const checkEmail = await checkEmailExists(tempUser.email);
      if(checkEmail){
        newErrors.email = "Email already exists."
      }

      if (!validateEmail(tempUser.email)) {
        newErrors.email = "Invalid email format";
      }
    }
    
      if (!tempUser.phoneNumber.startsWith("+60") || tempUser.phoneNumber.length < 10) {
        newErrors.phoneNumber = "Phone number must start with +60 and have at least 10 digits";
      }
      setErrors(newErrors);

      if (!newErrors.email && !newErrors.phoneNumber && !newErrors.address) {
        // Update profile using the UserContext method
        const success = await updateCollector(
          id,
          tempUser.name,
          tempUser.email,
          tempUser.phoneNumber
        );
  
        if (success) {
          setModal1Visible(false);
          navigation.replace('CLProfile', { id: id });
          Alert.alert("Success", "Profile updated successfully!");
        } else {
          Alert.alert("Error", "Failed to update profile. Please try again.");
        }
      }
  };

  const handleChangePassword = async () => {
    let newErrors = { originPassword: "", password: "", confirmPassword: "" };

    // Password validation regex - at least 8 chars, 1 number, 1 special char
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (!tempPassword.originPassword) {
      newErrors.originPassword = "Current password cannot be empty";
    }

    const result = await validateCollectorPass(id, tempPassword.originPassword);
    if (!result.success){
      newErrors.originPassword = result.message
    }

    if (!tempPassword.password) {
      newErrors.password = "New password cannot be empty";
    } else if (!passwordRegex.test(tempPassword.password)) {
      newErrors.password = "Password must be at least 8 characters long, containing at least one number and one special character";
    }

    if (tempPassword.confirmPassword !== tempPassword.password) {
      newErrors.confirmPassword = "Confirm password does not match new password";
    }

    setPasswordErrors(newErrors);

    if (newErrors.originPassword || newErrors.password || newErrors.confirmPassword) {
      return;
    }

    try {
      const success = await updateCollectorPassword(id, tempPassword.password, tempPassword.originPassword);

      if (success?.success) {
        setPasswordErrors({ originPassword: "", password: "", confirmPassword: "" });
        setTempPassword({ originPassword: "", password: "", confirmPassword: "" });      
        setModal2Visible(false);
        navigation.replace("CLProfile", {id: id});
        Alert.alert("Success", "Password changed successfully!");
      }else {
        Alert.alert("Error", success?.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const handleTabPress = (tabName: string) => {
    if(tabName === 'CLHome'){
      navigation.navigate(tabName, {id: id});
    } else if (tabName === 'CLHistory'){
      navigation.navigate(tabName, {id: id});
    }
  };

  // If user is not loaded yet, show a loading indicator
  if (!displayCollector) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Icon name="account-circle" size={60} color="#a393eb" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{displayCollector.user_name}</Text>
            <Text style={styles.email}>{displayCollector.email}</Text>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => setModal1Visible(true)}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoItem}>
            <Icon name="phone" size={20} color="#5E4DCD" />
            <Text style={styles.infoText}>{displayCollector.phone_number}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="office-building" size={20} color="#5E4DCD" />
            <Text style={styles.infoText}>
              Organization: {getOrganizationName(displayCollector?.organization_id)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account management</Text>
          <TouchableOpacity style={styles.listItem} onPress={() => setModal2Visible(true)}>
            <Icon name="key" size={20} color="#5E4DCD" />
            <Text style={styles.listText}>Change password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem} onPress={handleLogout}>
            <Icon name="logout" size={20} color="#D32F2F" />
            <Text style={[styles.listText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <TouchableOpacity style={styles.listItem} onPress={() => handleTabPress("CLHistory")}>
            <Icon name="history" size={20} color="#5E4DCD" />
            <Text style={styles.listText}>Pickups History</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacer to ensure content isn't hidden behind fixed nav bar */}
        <View style={{height: 80}} />
      </ScrollView>

      {/* Bottom Navigation - Now outside of ScrollView */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("CLHome")}>
          <MenuIcon name="home" size={24} color="#666666" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("CLHistory")}>
          <MenuIcon name="history" size={24} color="#666666" />
          <Text style={styles.navText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("CLProfile")}>
          <MenuIcon name="person" size={24} color="#5E4DCD" />
          <Text style={styles.activeNavText}>Profile</Text>
        </TouchableOpacity>
      </View>
      
      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modal1Visible}
        onRequestClose={() => {
          setModal1Visible(false);
          // Reset temp user to current user data
          if (displayCollector) {
            setTempUser({
              name: displayCollector?.name,
              email: displayCollector?.email,
              phoneNumber: displayCollector?.phone_number
            });
          }
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              onPress={() => {
                setModal1Visible(false);
                // Reset temp user to current user data
                if (displayCollector) {
                  setTempUser({
                    name: displayCollector?.user_name,
                    email: displayCollector?.email,
                    phoneNumber: displayCollector?.phone_number
                  });
                }
              }} 
              style={{ alignSelf: "flex-start" }}
            >
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={tempUser.email}
              onChangeText={(text) => setTempUser({ ...tempUser, email: text })}
              placeholderTextColor="#999999"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={tempUser.phoneNumber}
              onChangeText={handlePhoneNumberChange}
              placeholderTextColor="#999999"
            />
            {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}            
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
      
      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modal2Visible}
        onRequestClose={() => {
          setModal2Visible(false);
          clearModal2Data();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => { setModal2Visible(false); clearModal2Data(); }} style={{ alignSelf: "flex-start" }}>
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Current Password"
                value={tempPassword.originPassword}
                onChangeText={(text) => setTempPassword({ ...tempPassword, originPassword: text })}
                secureTextEntry={!passwordVisibility.origin}
                style={styles.input}
                placeholderTextColor="#999999"
              />
              <TouchableOpacity
                onPress={() =>
                  setPasswordVisibility((prev) => ({
                    ...prev,
                    origin: !prev.origin,
                  }))
                }
                style={styles.eyeIcon}
              >
                <Icon name={passwordVisibility.origin ? "eye-off" : "eye"} size={20} color="#555555" />
              </TouchableOpacity>
            </View>
            {passwordErrors.originPassword ? <Text style={styles.errorText}>{passwordErrors.originPassword}</Text> : null}
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="New Password"
                value={tempPassword.password}
                onChangeText={(text) => setTempPassword({ ...tempPassword, password: text })}
                secureTextEntry={!passwordVisibility.new}
                style={styles.input}
                placeholderTextColor="#999999"
              />
              <TouchableOpacity
                onPress={() =>
                  setPasswordVisibility((prev) => ({
                    ...prev,
                    new: !prev.new,
                  }))
                }
                style={styles.eyeIcon}
              >
                <Icon name={passwordVisibility.new ? "eye-off" : "eye"} size={20} color="#555555" />
              </TouchableOpacity>
            </View>
            {passwordErrors.password ? <Text style={styles.errorText}>{passwordErrors.password}</Text> : <Text style={styles.hintText}>At least 8 characters long, containing at least one number and one special character</Text>}
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Confirm new Password"
                value={tempPassword.confirmPassword}
                onChangeText={(text) => setTempPassword({ ...tempPassword, confirmPassword: text })}
                secureTextEntry={!passwordVisibility.confirm}
                style={styles.input}
                placeholderTextColor="#999999"
              />
              <TouchableOpacity
                onPress={() =>
                  setPasswordVisibility((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
                style={styles.eyeIcon}
              >
                <Icon name={passwordVisibility.confirm ? "eye-off" : "eye"} size={20} color="#555555" />
              </TouchableOpacity>
            </View>
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "white",
    position: "relative",
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EBF8",
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 0,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 0,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e5ddff",
    marginBottom: 10,
    marginTop: 20,
    marginLeft: 10,
  },
  userInfo: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  email: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 10,
  },
  editProfileButton: {
    backgroundColor: "#5E4DCD",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: "70%",
    alignItems: "center",
  },
  editProfileText: {
    color: "#fff",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555555",
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 10,
    color: "#333333",
    flex: 1,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  listText: {
    fontSize: 14,
    marginLeft: 10,
    color: "#333333",
  },
  logoutText: {
    color: "#D32F2F",
  },
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
    height: 60,
    zIndex: 999,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  activeNavText: {
    color: "#5E4DCD",
    fontWeight: "500",
    marginTop: 4,
    fontSize: 12,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333333",
    marginTop: 20,
  },
  input: {
    width: "97%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: "#333333",
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
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorText: {
    color: "#E53935",
    fontSize: 12,
    marginBottom: 10,
  },
  hintText: {
    color: "#555555",
    fontSize: 12,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    width: "95%"
  },
  eyeIcon: {
    padding: 5,
  },
});

export default CLProfileScreen;