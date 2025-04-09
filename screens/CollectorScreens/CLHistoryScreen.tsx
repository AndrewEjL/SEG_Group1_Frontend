import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, SafeAreaView, Dimensions , Linking,TextInput} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Dropdown } from "react-native-element-dropdown";
import RouteInfo from "../RecipientHomePageScreens/RouteInfo.tsx";

type NavigationProp = {
  navigate: (screen: string) => void;
};

type CLHistoryScreenProps = {
  navigation: NavigationProp;
};

const CLHistoryScreen: React.FC<CLHistoryScreenProps> = ({ navigation }) => {

  const [completedPickups, setCompletedPickups] = useState<any[]>([]);

  // State for UI components
  const [modal1Visible, setModal1Visible] = useState(false);

  const [selectedPickup, setSelectedPickup] = useState<any | null>(null); // Mock data type
  const [loading, setLoading] = useState<boolean>(true);


  // Get screen dimensions
  const windowHeight = Dimensions.get('window').height;

  // Calculate table height - subtract space for headers, nav, padding
  const navHeight = 60;  // Bottom nav height
  const headerHeight = 120; // Approx header section height
  const spacing = 100;  // Additional spacing for margins, padding etc.

  // Calculate each table's height
  const tableHeight = (windowHeight - headerHeight - navHeight - spacing) ;

  // Load data when component mounts and when screen comes into focus
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate loading pending pickups and collectors from mock data
    const mockPendingPickups = [
      {
        id: "1",
        clientId: "1",
        name: "S24 Ultra",
        type: "Phone",
        condition: "Working",
        quantity: 1,
        address: "3, Eko Galleria, C0301, C0302, C0401, Blok C, Taman, Persiaran Eko Botani, 79100 Iskandar Puteri, Johor Darul Ta'zim",
        pickupStatus: "Out for pickup",
        collectedTimestamp: new Date().toISOString(),
        weight: 5,
        dimensions: { length: 15, width: 10, height: 5 },
      },
      {
        id: "2",
        clientId: "2",
        name: "S23 Ultra",
        type: "Phone",
        condition: "Working",
        quantity: 1,
        address: "3, Eko Galleria, C0301, C0302, C0401, Blok C, Taman, Persiaran Eko Botani, 79100 Iskandar Puteri, Johor Darul Ta'zim",
        pickupStatus: "Collected",
        collectedTimestamp: new Date().toISOString(),
        weight: 5,
        dimensions: { length: 15, width: 10, height: 5 },
      }
    ];
      setCompletedPickups(mockPendingPickups);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load pickup data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 const viewPickupDetails = (pickup: any) => {
     setSelectedPickup(pickup);
     setModal1Visible(true);
 }
 const formatDate = (isoString) => {
   const date = new Date(isoString);
   date.setHours(date.getHours() + 8);
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');
   return `${year}-${month}-${day}`;
 };
 const formatDateTime = (isoString) => {
   const date = new Date(isoString);
   date.setHours(date.getHours() + 8);
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');
   const hours = String(date.getHours()).padStart(2, '0');
   const minutes = String(date.getMinutes()).padStart(2, '0');
   const seconds = String(date.getSeconds()).padStart(2, '0');
   return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
 };

  const handleTabPress = (tabName: string) => {
    navigation.navigate(tabName);
  };

  const formatDimensions = (item: any) => {
    return `${item.dimensions?.length} cm x ${item.dimensions?.width} cm x ${item.dimensions?.height} cm`;
  };

const handleCall = (phoneNumber) => {
  Linking.openURL(`tel:${phoneNumber}`);
};

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.headerSection}>
          <Text style={styles.header}>Completed pickups</Text>
          <View style={[styles.tableContainer, { height: tableHeight }]}>
            {completedPickups.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {loading ? "Loading completed pickups..." : "No completed pickups"}
                </Text>
              </View>
            ) : (
              <FlatList
                style={styles.flatList}
                data={completedPickups}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.pendingCard}>
                    <View style={styles.pickupInfo}>
                      <Text style={styles.itemText}>
                       {item.name} - {item.type}
                      </Text>
                      <Text style={styles.collectorText}>{formatDate(item.collectedTimestamp)}</Text>
                    </View>
                    <View style={styles.iconRow}>
                      <TouchableOpacity
                         onPress={() => viewPickupDetails(item)}
                      >
                        <Icon name="visibility" size={24} color="#b366ff" />
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
          <Icon name="home" size={24} color="#666666" />
          <Text style={styles.anavText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("CLHistory")}>
          <Icon name="history" size={24} color="#5E4DCD" />
          <Text style={styles.activeNavText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("CLProfile")}>
          <Icon name="person" size={24} color="#666666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for viewing history pickups details */}
      <Modal visible={modal1Visible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modal1Content}>
            <TouchableOpacity onPress={() => setModal1Visible(false)} style={{ alignSelf: "flex-start" }}>
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pickup details</Text>

            {selectedPickup && (
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.detailsContainer}>
                  <Text style={styles.label}><Text style={styles.bold}>Item Name:</Text> {selectedPickup.name}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Type:</Text> {selectedPickup.type}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Condition:</Text> {selectedPickup.condition}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Size:</Text> {formatDimensions(selectedPickup)}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Quantity:</Text> {selectedPickup.quantity}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Address:</Text> {selectedPickup.address}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Client name:</Text> {selectedPickup.clientId}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Client contact number:</Text>
                      <TouchableOpacity onPress={() => handleCall("+60123456789")} style={styles.touchable} >
                        <Text style={styles.phonelabel}>+60123456789</Text>
                      </TouchableOpacity>
                  </Text>
                  <Text style={styles.label}><Text style={styles.bold}>Collected time:</Text> {formatDateTime(selectedPickup.collectedTimestamp)} (UTC+8)</Text>
                </View>
              </ScrollView>
            )}
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
  color: '#5E4DCD',
  fontWeight: '500',
  backgroundColor: 'white',
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 4,
  marginRight: 10,
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
      height:"5%",
  },
  phonelabel: {
    alignSelf: "flex-start",
    fontSize: 14,
    marginTop: 5,
    color: "#0066CC",
    textDecorationLine: 'underline',
  },

});

export default CLHistoryScreen;
