import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, SafeAreaView, Dimensions, Linking, TextInput } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Dropdown } from "react-native-element-dropdown";
import RouteInfo from "./RouteInfo.tsx";
import { useUser, ScheduledPickup } from "../../contexts/UserContext";

// Extended ScheduledPickup type to include weight property
interface ExtendedPickup extends ScheduledPickup {
  weight?: number;
  collectedTimestamp?: string;
}

type NavigationProp = {
  navigate: (screen: string) => void;
  addListener: (event: string, callback: () => void) => () => void;
};

type CLHistoryScreenProps = {
  navigation: NavigationProp;
};

const CLHistoryScreen: React.FC<CLHistoryScreenProps> = ({ navigation }) => {
  const { user, getCollectorPickups } = useUser();

  const [completedPickups, setCompletedPickups] = useState<ExtendedPickup[]>([]);

  // State for UI components
  const [modal1Visible, setModal1Visible] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<ExtendedPickup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Add mockUsers to get client names - in a real app, this would be a backend API call
  const mockUsers: Record<string, { name: string; phoneNumber: string }> = {
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

  // Get screen dimensions
  const windowHeight = Dimensions.get('window').height;

  // Calculate table height - subtract space for headers, nav, padding
  const navHeight = 60;  // Bottom nav height
  const headerHeight = 120; // Approx header section height
  const spacing = 100;  // Additional spacing for margins, padding etc.

  // Calculate each table's height
  const tableHeight = (windowHeight - headerHeight - navHeight - spacing);

  // Load data when component mounts and when screen comes into focus
  useEffect(() => {
    loadData();

    // Add a focus listener to reload data when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    // Clean up the listener when component unmounts
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("Loading history for collector:", user?.name);
      
      // Get all pickups for this collector
      const collectorPickups = await getCollectorPickups();
      console.log("Total collector pickups:", collectorPickups.length);
      
      // Only keep pickups that are Recycled (fully completed with weight)
      const completedPickupsData = collectorPickups.filter(pickup => 
        pickup.pickupStatus === 'Recycled'
      ) as ExtendedPickup[];
      
      console.log("Completed pickups with weight:", completedPickupsData.length);
      setCompletedPickups(completedPickupsData);
    } catch (error) {
      console.error("Error loading history data:", error);
      Alert.alert("Error", "Failed to load pickup history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const viewPickupDetails = (pickup: ExtendedPickup) => {
    setSelectedPickup(pickup);
    setModal1Visible(true);
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    date.setHours(date.getHours() + 8);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateTime = (isoString: string) => {
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

  // Helper function to safely handle dimensions
  const formatDimensions = (pickup: ExtendedPickup) => {
    // Instead of checking for dimensions on PickupItem (which doesn't have dimensions property), 
    // we could use item information to describe the pickup
    return 'Dimensions not available';
  };

  const handleCall = (phoneNumber: string) => {
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
                        {item.items && item.items.length > 0 
                          ? `${item.items[0].name} ${item.items.length > 1 ? `+ ${item.items.length - 1} more` : ''}`
                          : 'Item name not available'}
                      </Text>
                      <Text style={styles.collectorText}>
                        {item.date && `Completed: ${formatDate(item.date)}`}
                        {item.weight !== undefined && ` • Weight: ${item.weight} kg`}
                      </Text>
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
          <Text style={styles.navText}>Home</Text>
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
                  <Text style={styles.label}><Text style={styles.bold}>Weight:</Text> {selectedPickup.weight || 'Not recorded'} kg</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Address:</Text> {selectedPickup.address || 'Address not available'}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Client:</Text> {getClientName(selectedPickup.clientId)}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Client contact number:</Text>
                      <TouchableOpacity onPress={() => handleCall(getClientPhone(selectedPickup.clientId))} style={styles.touchable} >
                        <Text style={styles.phonelabel}>{getClientPhone(selectedPickup.clientId)}</Text>
                      </TouchableOpacity>
                  </Text>
                  <Text style={styles.label}><Text style={styles.bold}>Date completed:</Text> {formatDateTime(selectedPickup.date)} (UTC+8)</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Pickup status:</Text> {selectedPickup.pickupStatus}</Text>
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
    backgroundColor: "#f7f7f7",
  },
  headerSection: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    flex: 1,
  },
  flatList: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  pendingCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  pickupInfo: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  collectorText: {
    fontSize: 14,
    color: "#666",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  bottomNav: {
    height: 60,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  activeNavText: {
    fontSize: 12,
    color: "#5E4DCD",
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal1Content: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  modalScrollView: {
    marginTop: 10,
  },
  detailsContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
    color: "#555",
  },
  bold: {
    fontWeight: "bold",
    color: "#333",
  },
  touchable: {
    paddingLeft: 4,
  },
  phonelabel: {
    fontSize: 16,
    marginBottom: 12,
    color: "#5E4DCD",
    textDecorationLine: "underline",
  },
});

export default CLHistoryScreen;
