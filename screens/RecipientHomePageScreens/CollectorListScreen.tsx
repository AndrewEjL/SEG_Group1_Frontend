import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUser } from '../../contexts/UserContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[0-9])(?=.*[\W_]).{8,}$/;

interface Employee {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword?: string;
}

interface EmployeeErrors {
  name?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
}

const CollectorListScreen = () => {
  const { getCollectors, addCollector, removeCollector } = useUser();
  const [existingEmails, setExistingEmails] = useState<string[]>(["john@example.com", "jane@example.com", "michael@example.com"]);
  const [newEmployees, setNewEmployees] = useState<Employee[]>([
    { id: 'collector1', name: 'John Doe', email: 'john@example.com', phoneNumber: '123456789', password: 'Pass@1234' },
    { id: 'collector2', name: 'Jane Smith', email: 'jane@example.com', phoneNumber: '123456780', password: 'Pass@1234' },
    { id: 'collector3', name: 'Michael Brown', email: 'michael@example.com', phoneNumber: '123456781', password: 'Pass@1234' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Employee>({ 
    id: '', name: '', email: '', phoneNumber: '', password: '', confirmPassword: '' 
  });
  const [errors, setErrors] = useState<EmployeeErrors>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);


const handleDelete = async (id: string) => {
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
        onPress: async () => {
          // Remove from mock data
          const success = await removeCollector(id);
          if (success) {
            // Also remove from local state
            setNewEmployees((prev) => prev.filter((item) => item.id !== id));
            // Remove from existingEmails list
            const employee = newEmployees.find(emp => emp.id === id);
            if (employee) {
              setExistingEmails(prev => prev.filter(email => email !== employee.email));
            }
            Alert.alert("Success", "Collector removed successfully");
          } else {
            Alert.alert("Error", "Failed to remove collector");
          }
        },
      },
    ]
  );
};


  const validateAndAddEmployee = async () => {
    let validationErrors: EmployeeErrors = {};
    if (!newEmployee.name.trim()) validationErrors.name = "Name is required.";
    if (!newEmployee.email.trim()) validationErrors.email = "Email is required.";
    else if (!emailRegex.test(newEmployee.email)) validationErrors.email = "Invalid email format.";
    else if (existingEmails.includes(newEmployee.email)) validationErrors.email = "Email already exists.";
    if (!newEmployee.phoneNumber.trim()) validationErrors.phoneNumber = "Phone number is required.";
    if (newEmployee.phoneNumber.length < 8) validationErrors.phoneNumber = "Phone number must have at least 9 digit";
    if (!newEmployee.password.trim()) validationErrors.password = "Password is required.";
    else if (!passwordRegex.test(newEmployee.password)) validationErrors.password = "At least 8 characters and include a number and a special character.";
    if (newEmployee.password !== newEmployee.confirmPassword) validationErrors.confirmPassword = "Passwords do not match.";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Strip the +60 prefix if it exists
    const phoneNumber = newEmployee.phoneNumber.startsWith('+60') 
      ? newEmployee.phoneNumber.slice(3) 
      : newEmployee.phoneNumber;
    
    // Add the collector to the global mock data first
    const success = await addCollector(
      newEmployee.name,
      newEmployee.email,
      phoneNumber,
      newEmployee.password
    );
    
    if (success) {
      // Generate a collector ID in the format 'collectorX' where X is a number
      const collectorId = `collector${newEmployees.length + 4}`;
      
      // Add the new employee to local state
      setNewEmployees([...newEmployees, { 
        ...newEmployee, 
        id: collectorId,
        phoneNumber: phoneNumber
      }]);
      
      // Add to existingEmails
      setExistingEmails([...existingEmails, newEmployee.email]);
      
      // Reset form
      setNewEmployee({ id: '', name: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
      setModalVisible(false);
      setErrors({});
      Alert.alert("Success", "Collector added successfully");
    } else {
      Alert.alert("Error", "Failed to add collector. The email might already be in use.");
    }
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
        <View style={styles.collectorInfo}>
          <Text style={styles.collectorName}>{item.name}</Text>
          <Text style={styles.collectorEmail}>{item.email}</Text>
          <Text style={styles.collectorPhone}>+60{item.phoneNumber}</Text>
        </View>
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
              id: '',
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
          value={newEmployee.phoneNumber ? `+60${newEmployee.phoneNumber}` : ""}
          onChangeText={(text) => {
            const numberOnly = text.startsWith("+60")
              ? text.slice(3).replace(/\D/g, "")
              : text.replace(/\D/g, "");
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

  collectorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  
  collectorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  
  collectorEmail: {
    fontSize: 14,
    color: '#333333',
  },
  
  collectorPhone: {
    fontSize: 12,
    color: '#666666',
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
    width: "100%",
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
    width: "100%",
    position: "relative"
  },

  eyeIcon: {
    position: "absolute",
    right: 0,
    padding: 10
  },
});


export default CollectorListScreen;

