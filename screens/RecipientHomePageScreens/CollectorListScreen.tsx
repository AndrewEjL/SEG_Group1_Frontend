import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const existingEmails = ["test@example.com", "user@gmail.com"];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[0-9])(?=.*[\W_]).{8,}$/;

const CollectorListScreen = () => {
  const [newEmployees, setNewEmployees] = useState([
    { id: '1', name: 'John Doe', email: 'test@example.com', phoneNumber: '1234567890', password: 'Pass@1234' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);


const handleDelete = (id) => {
  Alert.alert(
    "Confirm Deletion",
    "Are you sure you want to delete this employee?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setNewEmployees((prev) => prev.filter((item) => item.id !== id));
        },
      },
    ]
  );
};


  const validateAndAddEmployee = () => {
    let validationErrors = {};
    if (!newEmployee.name.trim()) validationErrors.name = "Name is required.";
    if (!newEmployee.email.trim()) validationErrors.email = "Email is required.";
    else if (!emailRegex.test(newEmployee.email)) validationErrors.email = "Invalid email format.";
    else if (existingEmails.includes(newEmployee.email)) validationErrors.email = "Email already exists.";
    if (!newEmployee.phoneNumber.trim()) validationErrors.phoneNumber = "Phone number is required.";
    if (!newEmployee.password.trim()) validationErrors.password = "Password is required.";
    else if (!passwordRegex.test(newEmployee.password)) validationErrors.password = "At least 8 characters and include a number and a special character.";
    if (newEmployee.password !== newEmployee.confirmPassword) validationErrors.confirmPassword = "Passwords do not match.";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setNewEmployees([...newEmployees, { ...newEmployee, id: (newEmployees.length + 1).toString() }]);
    setNewEmployee({ name: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
    setModalVisible(false);
    setErrors({});
  };

return (
<View style={styles.container}>
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.addButton}
      onPress={() => setModalVisible(true)}
    >
      <Text style={styles.addButtonText}>+ Add</Text>
    </TouchableOpacity>
  </View>

  <FlatList
    data={newEmployees}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <View style={styles.itemContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <Text style={styles.collectorText}>{item.email}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Icon name="trash-can" size={24} color="#333333" />
        </TouchableOpacity>
      </View>
    )}
  />

  <Modal visible={modalVisible} transparent animationType="slide">
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <TouchableOpacity
          onPress={() => {
            setModalVisible(false);
            setErrors({});
            setNewEmployee({
              name: '',
              email: '',
              phoneNumber: '',
              password: '',
              confirmPassword: ''
            });
          }}
        >
          <Icon name="close" size={24} color="#333333" />
        </TouchableOpacity>

        <Text style={styles.modalTitle}>Add Employee</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          value={newEmployee.name}
          onChangeText={(text) => setNewEmployee({ ...newEmployee, name: text })}
          placeholderTextColor="#999999"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={newEmployee.email}
          onChangeText={(text) => setNewEmployee({ ...newEmployee, email: text })}
          placeholderTextColor="#999999"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={`+60${newEmployee.phoneNumber}`}
          onChangeText={(text) => {
            if (!text.startsWith("+60")) {
              text = "+60";
            }
            const numberOnly = text.slice(3).replace(/\D/g, "");
            setNewEmployee({ ...newEmployee, phoneNumber: numberOnly });
          }}
          placeholderTextColor="#999999"
        />
        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!passwordVisible}
            value={newEmployee.password}
            onChangeText={(text) => setNewEmployee({ ...newEmployee, password: text })}
            placeholderTextColor="#999999"
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={styles.eyeIcon}
          >
            <Icon name={passwordVisible ? "eye-off" : "eye"} size={20} color="#555555" />
          </TouchableOpacity>
        </View>
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : (
          <Text style={styles.hintText}>
            At least 8 characters and include a number and a special character.
          </Text>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry={!confirmPasswordVisible}
            value={newEmployee.confirmPassword}
            onChangeText={(text) => setNewEmployee({ ...newEmployee, confirmPassword: text })}
            placeholderTextColor="#999999"
          />
          <TouchableOpacity
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            style={styles.eyeIcon}
          >
            <Icon name={confirmPasswordVisible ? "eye-off" : "eye"} size={20} color="#555555" />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={validateAndAddEmployee}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
</View>
)};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },

  header: {
    flexDirection: 'row',
    justifyContent: "flex-end",
    marginBottom: 16
  },

  addButton: {
    backgroundColor: "#5E4DCD",
    padding: 10,
    borderRadius: 5
  },

  addButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },

  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D8BFD8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },

  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333'
  },

  collectorText: {
    flex: 1,
    fontSize: 18,
    color: '#333333'
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)"
  },

  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: '#333333'
  },

  input: {
    width: "90%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: '#333333'
  },

  saveButton: {
    backgroundColor: "#5E4DCD",
    padding: 10,
    borderRadius: 5,
    alignItems: "center"
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold"
  },

  errorText: {
    color: "#E53935",
    fontSize: 12,
    marginBottom: 10
  },

  hintText: {
    color: "#555555",
    fontSize: 12,
    marginBottom: 10
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    width: "100%"
  },

  eyeIcon: {
    padding: 10
  },
});


export default CollectorListScreen;

