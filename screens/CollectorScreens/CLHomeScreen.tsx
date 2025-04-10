import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, SafeAreaView, Dimensions , Linking, TextInput} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Dropdown } from "react-native-element-dropdown";
import RouteInfo from "./RouteInfo.tsx";
import { useUser, ScheduledPickup } from "../../contexts/UserContext";

type NavigationProp = {
  navigate: (screen: string) => void;
};

type CLHomeScreenProps = {
  navigation: NavigationProp;
};

const CLHomeScreen: React.FC<CLHomeScreenProps> = ({ navigation }) => {
  const { user, getCollectorPickups, updatePickupStatus, updatePickup } = useUser();

  // State for pending pickups (pickups that are in progress)
  const [pendingPickups, setPendingPickups] = useState<ScheduledPickup[]>([]);
  const [completedPickups, setCompletedPickups] = useState<ScheduledPickup[]>([]);

  // State for UI components
  const [modal1Visible, setModal1Visible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [modal3Visible, setModal3Visible] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<ScheduledPickup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [weightInput, setWeightInput] = useState<string>('');
  const [weightError, setWeightError] = useState<string>('');

  // Get screen dimensions
  const windowHeight = Dimensions.get('window').height;

  // Calculate table height - subtract space for headers, nav, padding
  const navHeight = 60;  // Bottom nav height
  const headerHeight = 120; // Approx header section height
  const spacing = 100;  // Additional spacing for margins, padding etc.

  // Calculate each table's height
  const tableHeight = (windowHeight - headerHeight - navHeight - spacing);

  // Add mockUsers to get client names - in a real app, this would be a backend API call
  const mockUsers = {
    '1': { name: 'John Doe', phoneNumber: '+601233335555' },
    '2': { name: 'GreenTech Recyclers', phoneNumber: '+601244445555' },
    '3': { name: 'EcoLife Solutions', phoneNumber: '+601244446666' },
    '4': { name: 'ReNew Electronics', phoneNumber: '+601244447777' },
    '5': { name: 'John Collector', phoneNumber: '+601244448888' },
  };

  // Function to get client name from clientId
  const getClientName = (clientId: string | undefined) => {
    if (!clientId) return "Unassigned";
    return mockUsers[clientId]?.name || `Client ${clientId}`;
  };

  // Function to get client phone from clientId
  const getClientPhone = (clientId: string | undefined) => {
    if (!clientId) return "+60123456789"; // Default fallback
    return mockUsers[clientId]?.phoneNumber || "+60123456789";
  };

  // Load data when component mounts and when screen comes into focus
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("Loading data for collector:", user?.name);
      
      // Get pickups assigned to this collector
      const collectorPickups = await getCollectorPickups();
      console.log("Collector pickups:", collectorPickups.length);
      
      // Separate into pending and completed pickups based on pickupStatus
      const pending = collectorPickups.filter(pickup => 
        pickup.pickupStatus === 'Out for pickup' || !pickup.pickupStatus
      );
      
      const collected = collectorPickups.filter(pickup => 
        pickup.pickupStatus === 'Collected' && !pickup.weight
      );
      
      console.log("Pending pickups:", pending.length);
      console.log("Collected pickups:", collected.length);
      
      setPendingPickups(pending);
      setCompletedPickups(collected);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load pickup data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

const handleMarkAsCollected = async (pickup: ScheduledPickup) => {
  // Confirmation alert
  Alert.alert(
    "Confirm Pickup",
    "Are you sure you want to mark this pickup as collected?",
    [
      {
        text: "Cancel",
        style: "cancel", // Close the alert without doing anything
      },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            // Update the pickup status to 'Collected' in UserContext
            const success = await updatePickupStatus(pickup.id, 'Collected');
            
            if (success) {
              // Update the state with the new status
              const updatedPickup = { 
                ...pickup, 
                pickupStatus: "Collected", 
                collectedTimestamp: new Date().toISOString() 
              };

              setPendingPickups(prevPickups => 
                prevPickups.filter(p => p.id !== pickup.id)
              );
              
              setCompletedPickups(prevCompleted => 
                [...prevCompleted, updatedPickup]
              );
              
              Alert.alert("Success", "Pickup has been marked as collected");
            } else {
              Alert.alert("Error", "Failed to update pickup status");
            }
          } catch (error) {
            console.error("Error updating pickup status:", error);
            Alert.alert("Error", "An error occurred while updating pickup status");
          }
          
          setModal1Visible(false);
        },
      },
    ],
    { cancelable: true }
  );
};

const handleWeightChange = (text: string) => {
  // Regular expression: allow up to 3 decimal places
  const regex = /^\d*\.?\d{0,3}$/;

  if (regex.test(text)) {
    setWeightInput(text);
    setWeightError('');
  } else {
    setWeightError('Please enter a number with up to three decimal places');
  }
};

const handleSubmitWeight = async () => {
  if (!weightInput || isNaN(Number(weightInput)) || weightError) {
    Alert.alert('Error', 'Please enter a valid weight');
    return;
  }

  if (selectedPickup) {
    try {
      // Create an updated pickup with the weight value
      const updatedPickup = {
        ...selectedPickup,
        weight: Number(weightInput),
        pickupStatus: 'Recycled',
        date: new Date().toISOString() // Set current date as completion date
      };
      
      // Update pickup status to 'Recycled' in UserContext
      const success = await updatePickupStatus(selectedPickup.id, 'Recycled');
      
      if (success) {
        // Update the full pickup with weight information
        updatePickup(updatedPickup);
        
        // Update local state
        setCompletedPickups(prevPickups => 
          prevPickups.filter(p => p.id !== selectedPickup.id)
        );
        
        Alert.alert('Success', `Successfully submitted weight: ${weightInput} kg`);
      } else {
        Alert.alert('Error', 'Failed to update pickup status');
      }
    } catch (error) {
      console.error("Error updating pickup status:", error);
      Alert.alert('Error', 'An error occurred while submitting weight');
    }
  }

  // Close the modal
  setModal3Visible(false);
  setWeightInput('');
};

  const handleUpdatePendingPickupStatus = (pickup: ScheduledPickup) => {
    setSelectedPickup(pickup);
    setModal1Visible(true);
  };

   const handleUpdateCollectedPickups = (pickup: ScheduledPickup) => {
     setSelectedPickup(pickup);
     setModal2Visible(true);
   };

   const handleEnterWeight = (pickup: ScheduledPickup) => {
     setSelectedPickup(pickup);
     setModal2Visible(false);
     setModal3Visible(true);
   };

  const handleTabPress = (tabName: string) => {
    navigation.navigate(tabName);
  };

  const formatDimensions = (item: any) => {
    if (item.dimensions) {
      return `${item.dimensions.length} cm x ${item.dimensions.width} cm x ${item.dimensions.height} cm`;
    }
    return 'Dimensions not available';
  };

const handleCall = (phoneNumber: string) => {
  Linking.openURL(`tel:${phoneNumber}`);
};

const getStatusStyle = (status: string | undefined) => {
  if (status === "Collected"){
      return styles.statusCollected;
  } else {
      return styles.statusPending;
  }
};

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.headerSection}>
          <Text style={styles.header}>Pending pickups</Text>
          <View style={[styles.tableContainer, { height: tableHeight }]}>
            {pendingPickups.length === 0 && completedPickups.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {loading ? "Loading pending pickups..." : "No pending pickups"}
                </Text>
              </View>
            ) : (
              <FlatList
                style={styles.flatList}
                data={[...pendingPickups, ...completedPickups]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.pendingCard}>
                    <View style={styles.pickupInfo}>
                      <Text style={styles.itemText}>
                        {item.items && item.items.length > 0 
                          ? `${item.items[0].name} ${item.items.length > 1 ? `+ ${item.items.length - 1} more` : ''}`
                          : 'Item name not available'}
                      </Text>
                      <Text style={styles.collectorText}>Client: {getClientName(item.clientId)}</Text>
                    </View>
                    <View style={styles.iconRow}>
                      <Text style={[styles.itemStatus, getStatusStyle(item.pickupStatus)]}>
                        {item.pickupStatus || "Out for pickup"}
                      </Text>
                      <TouchableOpacity style={styles.acceptButton}
                         onPress={() => {
                           if (!item.pickupStatus || item.pickupStatus === "Out for pickup") {
                             handleUpdatePendingPickupStatus(item);
                           } else {
                             handleUpdateCollectedPickups(item);
                           }
                         }}
                      >
                        <Text style={styles.acceptText}>Update</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("CLHome")}>
          <Icon name="home" size={24} color="#5E4DCD" />
          <Text style={styles.activeNavText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("CLHistory")}>
          <Icon name="history" size={24} color="#666666" />
          <Text style={styles.navText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("CLProfile")}>
          <Icon name="person" size={24} color="#666666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Update Modal for Out for pickup status */}
      <Modal visible={modal1Visible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modal1Content}>
            <TouchableOpacity onPress={() => setModal1Visible(false)} style={{ alignSelf: "flex-start" }}>
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pickup details</Text>

            {selectedPickup && (
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.mapWrapper}>
                  <RouteInfo initialDestination={selectedPickup.address || selectedPickup.facilityName} />
                </View>
                <View style={styles.detailsContainer}>
                  {selectedPickup.items && selectedPickup.items.length > 0 && (
                    <>
                      <Text style={styles.label}>
                        <Text style={styles.bold}>Item Name:</Text> {selectedPickup.items[0].name}
                      </Text>
                      {selectedPickup.items.length > 1 && (
                        <Text style={styles.label}>
                          <Text style={styles.bold}>Additional Items:</Text> {selectedPickup.items.length - 1} more items
                        </Text>
                      )}
                    </>
                  )}
                  <Text style={styles.label}><Text style={styles.bold}>Facility:</Text> {selectedPickup.facilityName}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Address:</Text> {selectedPickup.address || 'Address not available'}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Client:</Text> {getClientName(selectedPickup.clientId)}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Client contact number:</Text>
                      <TouchableOpacity onPress={() => handleCall(getClientPhone(selectedPickup.clientId))} style={styles.touchable} >
                        <Text style={styles.phonelabel}>{getClientPhone(selectedPickup.clientId)}</Text>
                      </TouchableOpacity>
                  </Text>
                </View>
              </ScrollView>
            )}
              <TouchableOpacity style={styles.assignButton} onPress={() => handleMarkAsCollected(selectedPickup!)}>
                <Text style={styles.acceptText}>Mark as collected</Text>
              </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Pickups details Modal*/}
      <Modal visible={modal2Visible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modal1Content}>
            <TouchableOpacity onPress={() => setModal2Visible(false)} style={{ alignSelf: "flex-start" }}>
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pickup details</Text>

            {selectedPickup && (
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.detailsContainer}>
                  {selectedPickup.items && selectedPickup.items.length > 0 && (
                    <>
                      <Text style={styles.label}>
                        <Text style={styles.bold}>Item Name:</Text> {selectedPickup.items[0].name}
                      </Text>
                      {selectedPickup.items.length > 1 && (
                        <Text style={styles.label}>
                          <Text style={styles.bold}>Additional Items:</Text> {selectedPickup.items.length - 1} more items
                        </Text>
                      )}
                    </>
                  )}
                  <Text style={styles.label}><Text style={styles.bold}>Facility:</Text> {selectedPickup.facilityName}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Address:</Text> {selectedPickup.address || 'Address not available'}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Client:</Text> {getClientName(selectedPickup.clientId)}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Client contact number:</Text>{getClientPhone(selectedPickup.clientId)}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Collected Time:</Text> {selectedPickup.collectedTimestamp || 'Not recorded'}</Text>
                </View>
              </ScrollView>
            )}
              <TouchableOpacity style={styles.assignButton} onPress={() => handleEnterWeight(selectedPickup!)}>
                <Text style={styles.acceptText}>Enter the weight of the item</Text>
              </TouchableOpacity>
          </View>
        </View>
      </Modal>
    {/* Pickups details Modal*/}
      <Modal visible={modal3Visible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modal1Content}>
            <TouchableOpacity onPress={() => setModal3Visible(false)} style={{ alignSelf: "flex-start" }}>
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Enter the weight of the item to completed this pickup</Text>
            <TextInput
              style={styles.input}
              placeholder="Weight (kg)"
              onChangeText={handleWeightChange}
              placeholderTextColor="#999999"
            />
            {weightError ? <Text style={styles.errorText}>{weightError}</Text> : <Text style={styles.hintText}>Unit is kilogram (kg), allow up to 3 decimal places</Text>}
              <TouchableOpacity style={[styles.assignButton, weightInput === '' || weightError !== '' ? styles.disabledButton : null]} onPress={() => handleSubmitWeight()} disabled={weightInput === '' || weightError !== ''}>
                <Text style={styles.acceptText}>Submit</Text>
              </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 60, // Space for bottom nav
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6a0dad",
    marginVertical: 10,
  },
  tableContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    // Height will be set dynamically based on screen size
  },
  flatList: {
    flex: 1,
    width: '100%',
  },
  multiSelectButton: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#5E4DCD",
  },
  multiSelectButtonActive: {
    backgroundColor: "#5E4DCD",
  },
  multiSelectText: {
    color: "#5E4DCD",
    fontWeight: "500",
    fontSize: 12,
  },
  multiSelectTextActive: {
    color: "white",
  },
  pickupCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e6e6fa",
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    minHeight: 60,
  },
  selectedPickupCard: {
    backgroundColor: "#d4c9ff",
    borderWidth: 1,
    borderColor: "#5E4DCD",
  },
  pendingCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e6e6fa",
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    minHeight: 60,
  },
  pickupInfo: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: "#333333",
  },
  addressHint: {
    fontSize: 12,
    color: "#6a0dad",
    fontStyle: "italic",
    marginTop: 2,
  },
  collectorText: {
    fontSize: 14,
    color: "#555555",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#b366ff",
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  acceptText: {
    color: "white",
    fontWeight: "500",
  },
  selectionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  selectionText: {
    color: "#333333",
    fontWeight: "500",
  },
  selectedItemsContainer: {
    width: "100%",
    marginBottom: 15,
  },
  selectedItemsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 5,
  },
  selectedItemsList: {
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
    padding: 5,
  },
  selectedItemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  selectedItemText: {
    marginLeft: 5,
    color: "#333333",
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
    width: 300,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  expandedModalContent: {
    width: 350,
    maxHeight: "80%",
  },
  modal1Content: {
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
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    marginTop: 10,
    color: "#333333",
  },
  bold: {
    alignSelf: "flex-start",
    fontSize: 14,
    marginTop: 10,
    fontWeight: "bold",
    color: "#333333",
  },
  assignButton: {
    backgroundColor: "#5E4DCD",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  assignText: {
    color: "white",
    fontWeight: "bold",
  },
  dropdown: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  itemTextStyle: {
    color: "#333333",
    fontSize: 16,
  },
  placeholderStyle: {
    color: "#555555",
    fontSize: 16,
  },
  selectedTextStyle: {
    color: "#5E4DCD",
    fontSize: 16,
  },
  inputSearchStyle: {
    color: "#333333",
    fontSize: 16,
  },
  statusContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666666",
  },
  modalScrollView: {
    width: '100%',
    maxHeight: '90%',
  },
  detailsContainer: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 20,
  },
  mapWrapper: {
    height: 500,
    width: '100%',
    position: 'relative',
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#f0f0f0',
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.7,
  },
itemStatus: {
  fontSize: 12,
  fontWeight: '500',
  backgroundColor: 'white',
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 4,
  marginRight: 10,
},
statusCollected: {
  color: '#138f2d',
},

statusPending: {
  color: '#1906c4',
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
  touchable: {
      paddingHorizontal: 5,
      height:"10%",
  },
  phonelabel: {
    alignSelf: "flex-start",
    fontSize: 14,
    marginTop: 5,
    color: "#0066CC",
    textDecorationLine: 'underline',
  },

});

export default CLHomeScreen;

