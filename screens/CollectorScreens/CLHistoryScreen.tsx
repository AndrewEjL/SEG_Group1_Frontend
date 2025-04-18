import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, SafeAreaView, Dimensions, Linking, TextInput } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Dropdown } from "react-native-element-dropdown";
import RouteInfo from "./RouteInfo.tsx";
import { useUser, ScheduledPickup } from "../../contexts/UserContext";
import { useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAllClient } from "../api/user/getAllClient.ts";
import { grabCollectorHistory } from "../api/transaction/grabCollectorHistory.ts";
import { useUserC } from "../api/organization/getUserC.ts";
import { displayEveryItemsWOStatus } from "../api/items/displayAllItemsWOStatus.ts";
import { useItemTypes } from "../api/items/itemTypes.ts";

type RootStackParamList = {
  CLHome: { id: number };
  CLProfile: { id:number };
  CLHistory: { id:number };
};

// Extended ScheduledPickup type to include weight property
interface ExtendedPickup extends ScheduledPickup {
  weight?: number;
  collectedTimestamp?: string;
}

type CLHistoryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CLHistory'>;
};

const CLHistoryScreen: React.FC<CLHistoryScreenProps> = ({ navigation }) => {
  const route = useRoute();
  const {id} = route.params;
  console.log("History: "+id)
  const { displayAllClient, loading: loadingAllClient } = useAllClient();
  const { displayCollectorHistory, loading: loadingCollectorHistory } = grabCollectorHistory(id);
  const { displayUserC, loading: loadingUserC } = useUserC(id);
  const { displayAllItemsWS, loading: loadingAllItems } = displayEveryItemsWOStatus();
  const { pickupStatus, loadingName } = useItemTypes();
  const { user, getCollectorPickups } = useUser();

  const [completedPickups, setCompletedPickups] = useState<ExtendedPickup[]>([]);

  // State for UI components
  const [modal1Visible, setModal1Visible] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<ExtendedPickup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Get screen dimensions
  const windowHeight = Dimensions.get('window').height;

  // Calculate table height - subtract space for headers, nav, padding
  const navHeight = 60;  // Bottom nav height
  const headerHeight = 120; // Approx header section height
  const spacing = 100;  // Additional spacing for margins, padding etc.

  // Calculate each table's height
  const tableHeight = (windowHeight - headerHeight - navHeight - spacing);

    // Function to get client name from clientId
    const getClientName = (clientId: number | undefined) => {
      if (!clientId) return "Unassigned";
      const client = displayAllClient.find((t) => t.id === clientId)
      return client.user_name;
    };
  
    // Function to get client phone from clientId
    const getClientPhone = (clientId: number | undefined) => {
      if (!clientId) return "+60123456789"; // Default fallback
      const client = displayAllClient.find((t) => t.id === clientId)
      return client.phone_number;
    };
  
    const getItemName = (itemId: number) => {
      if (!itemId) return "Unassigned";
      const item = displayAllItemsWS.find((t) => t.pickup_items_id === itemId);
      return item?.item_name || `Item ${itemId}`;
    };

    const getItemAddress = (itemId: number) => {
      if (!itemId) return "Unassigned";
      const itemLocation = displayAllItemsWS.find((t) => t.pickup_items_id === itemId);
      return itemLocation.pickup_location || "Unknown";
    }

    const getStatusName = (pickupStatusId: number | undefined) => {
      if(!pickupStatusId) return "Error";
      const pStatus = pickupStatus.find((t) => t.id === pickupStatusId)
      return pStatus?.name || "Unknown";
    }

  // Load data when component mounts and when screen comes into focus
  useEffect(() => {
    if(displayUserC && pickupStatus && displayCollectorHistory.length > 0){
      loadData();
    }
  }, [displayUserC, pickupStatus, displayCollectorHistory]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("Loading history for collector:", displayUserC?.user_name);
      
      // Only keep pickups that are Recycled (fully completed with weight)
      const completedPickupsData = displayCollectorHistory?.filter(pickup => 
        pickup?.pickup_status_id === 3 || 4
      )
      
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
    if(tabName === 'CLHome'){
      navigation.navigate(tabName, {id: id});
    } else if(tabName === 'CLProfile'){
      navigation.navigate(tabName, {id: id});
    }
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
            {displayCollectorHistory.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {loading ? "Loading completed pickups..." : "No completed pickups"}
                </Text>
              </View>
            ) : (
              <FlatList
                style={styles.flatList}
                data={completedPickups}
                keyExtractor={(item) => item.pickup_transaction_id}
                renderItem={({ item }) => (
                  <View style={styles.pendingCard}>
                    <View style={styles.pickupInfo}>
                      <Text style={styles.itemText}>
                        {getItemName(item.pickup_item_id)}
                      </Text>
                      <Text style={styles.collectorText}>
                        {item.updateDate && `Completed: ${formatDate(item.updateDate)}`}
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
                  <Text style={styles.label}>
                    <Text style={styles.bold}>Item Name:</Text> {getItemName(selectedPickup.pickup_item_id)}
                  </Text>
                  <Text style={styles.label}><Text style={styles.bold}>Weight:</Text> {selectedPickup.weight || 'Not recorded'} kg</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Address:</Text> {getItemAddress(selectedPickup.pickup_item_id) || 'Address not available'}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Client:</Text> {getClientName(selectedPickup.user_donor_id)}</Text>
                  <View style={styles.phoneStyle}>
                    <Text style={styles.bold}>Client contact number:</Text>
                    <TouchableOpacity onPress={() => handleCall(getClientPhone(selectedPickup.user_donor_id))} style={styles.touchable} >
                        <Text style={styles.phonelabel}>{getClientPhone(selectedPickup.user_donor_id)}</Text>
                      </TouchableOpacity>
                  </View>
                  <Text style={styles.label}><Text style={styles.bold}>Date completed:</Text> {formatDateTime(selectedPickup.updateDate)}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Pickup status:</Text> {getStatusName(selectedPickup.pickup_status_id)}</Text>
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
    marginBottom: 10,
    color: "#5E4DCD",
    textDecorationLine: "underline",
  },
  phoneStyle: {
    flexDirection: "row", 
    flexWrap: "wrap"
  },
});

export default CLHistoryScreen;
