import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUser } from '../../contexts/UserContext';
import { useRoute } from '@react-navigation/native';
import { useCollector } from '../api/organization/getCollector';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { checkEmailExists, registerCollector } from '../api/organization/registerCollector';
import { useDeleteCollector } from '../api/organization/deleteCollector';
import { useRestoreCollector } from '../api/organization/restoreCollector';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[0-9])(?=.*[\W_]).{8,}$/;

type RootStackParamList = {
  RHome: {id:number};
  RStats: {id:number};
  RProfile: {id:number};
  CollectorList: {id:number};
  // Add other screens as needed
};

type CollectorListProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CollectorList'>;
};

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

const CollectorListScreen: React.FC<CollectorListProps> = ({navigation}) => {
  const route = useRoute();
  const {id} = route.params;
  console.log(id)
  const { getCollectors, addCollector, removeCollector } = useUser();
  const { displayCollector, loading: loadingCollector} = useCollector(id);
  const { deleteCollector, loadingDelete, error } = useDeleteCollector();
  const { restoreCollector, loadingRestore, error: errorRestore } = useRestoreCollector();

  const [modalVisible, setModalVisible] = useState(false);
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Employee>({ 
    id: '', name: '', email: '', phoneNumber: '', password: '', confirmPassword: '' 
  });
  const [errors, setErrors] = useState<EmployeeErrors>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Load collectors when component mounts
  useEffect(() => {
    loadCollectors();
  }, []);

  const loadCollectors = async () => {
    setLoading(true);
    try {
      // Get all collectors from the organization
      const collectorsData = await getCollectors();
      
      // Convert to the Employee format
      const formattedCollectors = collectorsData.map(collector => ({
        id: collector.value,
        name: collector.label,
        email: collector.email,
        phoneNumber: collector.phoneNumber,
        password: 'Password@123' // Default password for UI only
      }));

      // Extract emails for validation
      const emails = formattedCollectors.map(c => c.email);
      setExistingEmails(emails);
      
      setCollectors(formattedCollectors);
    } catch (error) {
      console.error("Error loading collectors:", error);
      Alert.alert("Error", "Failed to load collectors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cid: number) => {
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
            const success = await deleteCollector(cid);
            if (success) {              
              navigation.replace("CollectorList", {id: id})
              Alert.alert("Success", "Collector removed successfully");
            } else {
              Alert.alert("Error", "Failed to remove collector");
            }
          },
        },
      ]
    );
  };

  const handleRestore = async (cid: number) => {
    Alert.alert(
      "Confirm Restore",
      "Are you sure you want to re-employ this employee?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restore",
          style: "destructive",
          onPress: async () => {
            const success = await restoreCollector(cid);
            if (success) {          
              setRestoreModalVisible(false);    
              navigation.replace("CollectorList", {id: id});
              Alert.alert("Success", "Collector restore successfully");
            } else {
              Alert.alert("Error", "Failed to restore collector");
            }
          },
        },
      ]
    );
  };


  const validateAndAddEmployee = async () => {
    const emailExists = await checkEmailExists(newEmployee.email);
    let validationErrors: EmployeeErrors = {};
    if (!newEmployee.name.trim()) validationErrors.name = "Name is required.";
    if (!newEmployee.email.trim()) validationErrors.email = "Email is required.";
    else if (!emailRegex.test(newEmployee.email)) validationErrors.email = "Invalid email format.";
    else if (emailExists) validationErrors.email = "Email already exists.";
    if (!newEmployee.phoneNumber.trim()) validationErrors.phoneNumber = "Phone number is required.";
    if (newEmployee.phoneNumber.length < 8) validationErrors.phoneNumber = "Phone number must have at least 9 digit";
    if (!newEmployee.password.trim()) validationErrors.password = "Password is required.";
    else if (!passwordRegex.test(newEmployee.password)) validationErrors.password = "At least 8 characters and include a number and a special character.";
    if (newEmployee.password !== newEmployee.confirmPassword) validationErrors.confirmPassword = "Passwords do not match.";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    const success = await registerCollector(
      newEmployee.name,
      newEmployee.email,
      newEmployee.password,
      newEmployee.phoneNumber,
      id
    )
    
    if (success) {          
      // Reset form
      setNewEmployee({ id: '', name: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
      setModalVisible(false);
      setErrors({});
      navigation.replace("CollectorList", {id: id});
      Alert.alert("Success", "Collector added successfully");
      
      // Reload collectors to get the updated list including the new collector
      loadCollectors();
    } else {
      Alert.alert("Error", "Failed to add collector. The email might already be in use.");
    }
  };
  
  const ActiveCollector = displayCollector?.filter(
    (c) => !c.isDelete && c.user_status_id === 1
  ) || [];

  const NonActiveCollector = displayCollector?.filter(
    (c) => !!c.isDelete && c.user_status_id === 2
  );

  console.log("All: ",displayCollector)
  console.log("Non-active: ",NonActiveCollector)

return (
<View style={styles.container}>
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.addButton}
      onPress={() => setModalVisible(true)}
    >
      <Text style={styles.addButtonText}>+ Add</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.restoreButton}
      onPress={() => setRestoreModalVisible(true)}
    >
      <Text style={styles.restoreButtonText}>Restore</Text>
    </TouchableOpacity>
  </View>

  <FlatList
    data={ActiveCollector}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <View style={styles.itemContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.user_name.charAt(0)}</Text>
        </View>
        <View style={styles.collectorInfo}>
          <Text style={styles.collectorName}>{item.user_name}</Text>
          <Text style={styles.collectorEmail}>{item.email}</Text>
          <Text style={styles.collectorPhone}>{item.phone_number}</Text>
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
          value={newEmployee.phoneNumber}
          onChangeText={(text) => {
            // Remove all non-digit characters EXCEPT the + at the start
            let formatted = text.replace(/[^\d]/g, '');

            // Always keep +60 at the start
            if (!formatted.startsWith('60')) {
              formatted = '60' + formatted;
            }

            setNewEmployee({ ...newEmployee, phoneNumber: `+${formatted}` });
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

  {/* Modal for restore */}
  <Modal visible={restoreModalVisible} transparent animationType="slide">
      <View style={styles.modalContainer}> 
        <View style={styles.modalContent}>  

        <TouchableOpacity
          onPress={() => {
            setRestoreModalVisible(false);            
          }}
        >
          <Icon name="close" size={24} color="#333333" />
        </TouchableOpacity>

          <Text style={styles.modalTitle}>Restore Collector</Text>
          {NonActiveCollector?.length === 0 ? (
            <Text>No Terminated collector Found.</Text>
          ) : (
            <FlatList
              data={NonActiveCollector}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.user_name.charAt(0)}</Text>
                  </View>
                  <View style={styles.collectorInfo}>
                    <Text style={styles.collectorName}>{item.user_name}</Text>
                    <Text style={styles.collectorEmail}>{item.email}</Text>
                    <Text style={styles.collectorPhone}>{item.phone_number}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRestore(item.id)}>
                    <Icon name="restore" size={24} color="#333333" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
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
  restoreButton: {
    backgroundColor: "#000000",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    marginRight: 10
  },
  restoreButtonText: {
    color: "white",
    fontWeight: "bold",
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
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

