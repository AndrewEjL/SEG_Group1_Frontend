import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MenuIcon from "react-native-vector-icons/MaterialIcons";
import { useUser } from '../../contexts/UserContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
const CLProfileScreen: React.FC<RProfileScreenProps> = ({ navigation }) => {
  const { user, logout, changePassword } = useUser();

  const [localUser, setLocalUser] = useState({
    organization: user?.name || "Collector Name",
    email: user?.email || "email@example.com",
    address: user?.address || "Address",
    phoneNumber: user?.phoneNumber || "+601233335555",
  });

  const [tempUser, setTempUser] = useState(localUser);
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
      setLocalUser(tempUser);
      setModal1Visible(false);
      Alert.alert("Success", "Profile updated successfully!");
    }
  };

  const handleChangePassword = async () => {
    let newErrors = { originPassword: "", password: "", confirmPassword: "" };

    // Password validation regex - at least 8 chars, 1 number, 1 special char
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (!tempPassword.password) {
      newErrors.password = "New password cannot be empty";
    } else if (!passwordRegex.test(tempPassword.password)) {
      newErrors.password = "Password must be at least 8 characters long, containing at least one number and one special character";
    }

    if (tempPassword.confirmPassword !== tempPassword.password) {
      newErrors.confirmPassword = "Confirm password does not match new password";
    }

    setPasswordErrors(newErrors);

    if (!newErrors.password && !newErrors.confirmPassword) {
      // Call the changePassword method from UserContext
      const success = await changePassword(tempPassword.originPassword, tempPassword.password);

      if (success) {
        // Clear the form
        setTempPassword({ originPassword: "", password: "", confirmPassword: "" });
        setPasswordVisibility({ origin: false, new: false, confirm: false });

        // Close the modal
        setModal2Visible(false);

        // Show success message
        Alert.alert("Success", "Password changed successfully!");
      } else {
        setPasswordErrors(prev => ({
          ...prev,
          originPassword: "Incorrect current password"
        }));
      }
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
    navigation.navigate(tabName);
  };


  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Icon name="account-circle" size={60} color="#a393eb" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{user?.name || localUser.organization}</Text>
          <Text style={styles.email}>{user?.email || localUser.email}</Text>
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


      {/* Bottom Navigation */}
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={modal1Visible}
        onRequestClose={() => setModal1Visible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => { setModal1Visible(false); setTempUser(localUser); }} style={{ alignSelf: "flex-start" }}>
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
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={tempUser.address}
              onChangeText={(text) => setTempUser({ ...tempUser, address: text })}
              placeholderTextColor="#999999"
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
            <TouchableOpacity onPress={() => { setModal2Visible(false); clearModal2Data(); }} style={{ alignSelf: "flex-start" }}>
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Origin Password"
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
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
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
    padding: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555555",
    marginBottom: 5,
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