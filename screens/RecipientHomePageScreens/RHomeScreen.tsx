import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, SafeAreaView, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Dropdown } from "react-native-element-dropdown";
import RouteInfo from "./RouteInfo.tsx";
import { useUser, type ListedItem, type ScheduledPickup } from "../../contexts/UserContext";
import { useFocusEffect } from "@react-navigation/native";
import { Checkbox } from "react-native-paper";

type NavigationProp = {
  navigate: (screen: string) => void;
};

type RHomeScreenProps = {
  navigation: NavigationProp;
};

const RHomeScreen: React.FC<RHomeScreenProps> = ({ navigation }) => {
  const { getAvailablePickups, getPendingPickups, acceptPickup, acceptMultiplePickups, getCollectors } = useUser();
  
  // State for available pickups (items ready to be picked up)
  const [availablePickups, setAvailablePickups] = useState<ListedItem[]>([]);
  
  // State for pending pickups (pickups that are in progress)
  const [pendingPickups, setPendingPickups] = useState<ScheduledPickup[]>([]);
  
  // State for multi-select mode
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // State for UI components
  const [modal1Visible, setModal1Visible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [modal3Visible, setModal3Visible] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<ListedItem | ScheduledPickup | null>(null);
  const [selectedCollector, setSelectedCollector] = useState<string | null>(null);
  const [collectors, setCollectors] = useState<{label: string, value: string}[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Get screen dimensions
  const windowHeight = Dimensions.get('window').height;
  
  // Calculate table height - subtract space for headers, nav, padding
  const navHeight = 60;  // Bottom nav height
  const headerHeight = 120; // Approx header section height
  const spacing = 100;  // Additional spacing for margins, padding etc.
  
  // Calculate each table's height
  const tableHeight = (windowHeight - headerHeight - navHeight - spacing) / 2;

  // Load data when component mounts and when screen comes into focus
  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      // Load available items for pickup from context
      const availableItems = await getAvailablePickups();
      setAvailablePickups(availableItems);
      
      // Load pending pickups from context
      const pendingPickupsData = await getPendingPickups();
      setPendingPickups(pendingPickupsData);
      
      // Load collectors from context
      const collectorsData = await getCollectors();
      setCollectors(collectorsData);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load pickup data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPickupDetails = (pickup: ListedItem) => {
    setSelectedPickup(pickup);
    setModal1Visible(true);
  };

  const handleAcceptPickup = (pickup: ListedItem) => {
    // If multiSelectMode is active, we just toggle the selection
    if (multiSelectMode) {
      toggleItemSelection(pickup.id);
      return;
    }
    
    // Otherwise, proceed with single item pickup
    setSelectedPickup(pickup);
    setSelectedItems([pickup.id]);
    setModal2Visible(true);
  };
  
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };
  
  const handleMultipleItemsSelection = () => {
    // If no items are selected, show an alert
    if (selectedItems.length === 0) {
      Alert.alert("No items selected", "Please select at least one item to create a pickup.");
      return;
    }
    
    // Open the collector assignment modal
    setModal2Visible(true);
  };
  
  const toggleMultiSelectMode = () => {
    // Toggle multi-select mode
    setMultiSelectMode(!multiSelectMode);
    
    // Clear selected items when exiting multi-select mode
    if (multiSelectMode) {
      setSelectedItems([]);
    }
  };

  const handleViewPendingPickupStatus = (pickup: ScheduledPickup) => {
    setSelectedPickup(pickup);
    setModal3Visible(true);
  };

  const handleAssignCollector = async () => {
    // Check that collector is selected and we have items
    if (!selectedCollector || selectedItems.length === 0) {
      return;
    }
    
    try {
      let success;
      
      if (selectedItems.length === 1) {
        // For a single item, use the legacy method
        success = await acceptPickup(selectedItems[0], selectedCollector);
      } else {
        // For multiple items, use the new method
        success = await acceptMultiplePickups(selectedItems, selectedCollector);
      }
      
      if (success) {
        Alert.alert("Success", `Pickup${selectedItems.length > 1 ? 's' : ''} assigned successfully`);
        setModal2Visible(false);
        setSelectedCollector(null);
        setSelectedItems([]);
        setMultiSelectMode(false);
        
        // Reload data to update both lists
        loadData();
      } else {
        Alert.alert("Error", "Failed to assign pickup. Please try again.");
      }
    } catch (error) {
      console.error("Error assigning collector:", error);
      Alert.alert("Error", "Failed to assign pickup. Please try again.");
    }
  };

  const handleTabPress = (tabName: string) => {
    navigation.navigate(tabName);
  };

  const formatDimensions = (item: ListedItem) => {
    return `${item.dimensions.length} x ${item.dimensions.width} x ${item.dimensions.height}`;
  };

  // Group items by address for multi-select functionality
  const groupedItems = availablePickups.reduce<{[address: string]: ListedItem[]}>((groups, item) => {
    if (!groups[item.address]) {
      groups[item.address] = [];
    }
    groups[item.address].push(item);
    return groups;
  }, {});

  // Find addresses with multiple items (potential for batch pickups)
  const addressesWithMultipleItems = Object.entries(groupedItems)
    .filter(([_, items]) => items.length > 1)
    .map(([address]) => address);

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header section */}
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Available pickups</Text>
          {addressesWithMultipleItems.length > 0 && (
            <TouchableOpacity 
              style={[styles.multiSelectButton, multiSelectMode && styles.multiSelectButtonActive]} 
              onPress={toggleMultiSelectMode}
            >
              <Text style={[styles.multiSelectText, multiSelectMode && styles.multiSelectTextActive]}>
                {multiSelectMode ? "Cancel" : "Multi-Select"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {multiSelectMode && selectedItems.length > 0 && (
          <View style={styles.selectionBar}>
            <Text style={styles.selectionText}>{selectedItems.length} items selected</Text>
            <TouchableOpacity style={styles.acceptButton} onPress={handleMultipleItemsSelection}>
              <Text style={styles.acceptText}>Create Pickup</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Main content area - non-scrollable */}
      <View style={styles.contentContainer}>
        {/* Available Pickups Table */}
        <View style={[styles.tableContainer, { height: tableHeight }]}>
          {availablePickups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? "Loading available pickups..." : "No available pickups"}
              </Text>
            </View>
          ) : (
            <FlatList
              style={styles.flatList}
              data={availablePickups}
              keyExtractor={(item) => item.id}
              scrollEnabled={true}
              renderItem={({ item }) => (
                <View style={[
                  styles.pickupCard, 
                  multiSelectMode && selectedItems.includes(item.id) && styles.selectedPickupCard
                ]}>
                  <View style={styles.pickupInfo}>
                    <Text style={styles.itemText}>{item.name}</Text>
                    {addressesWithMultipleItems.includes(item.address) && (
                      <Text style={styles.addressHint}>
                        Same location as {groupedItems[item.address].length - 1} other item(s)
                      </Text>
                    )}
                  </View>
                  <View style={styles.iconRow}>
                    {multiSelectMode ? (
                      <Checkbox
                        status={selectedItems.includes(item.id) ? 'checked' : 'unchecked'}
                        onPress={() => toggleItemSelection(item.id)}
                        color="#5E4DCD"
                      />
                    ) : (
                      <>
                        <TouchableOpacity onPress={() => handleViewPickupDetails(item)}>
                          <Icon name="visibility" size={20} color="#333333" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptPickup(item)}>
                          <Text style={styles.acceptText}>Accept</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              )}
            />
          )}
        </View>

        {/* Pending Pickups Header */}
        <Text style={styles.header}>Pending pickups</Text>
        
        {/* Pending Pickups Table */}
        <View style={[styles.tableContainer, { height: tableHeight }]}>
          {pendingPickups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? "Loading pending pickups..." : "No pending pickups"}
              </Text>
            </View>
          ) : (
            <FlatList
              style={styles.flatList}
              data={pendingPickups}
              keyExtractor={(item) => item.id}
              scrollEnabled={true}
              renderItem={({ item }) => (
                <View style={styles.pendingCard}>
                  <View style={styles.pickupInfo}>
                    <Text style={styles.itemText}>
                      {item.items.length > 1 
                        ? `${item.items[0]?.name} + ${item.items.length - 1} more`
                        : item.items[0]?.name || "Unknown Item"}
                    </Text>
                    <Text style={styles.collectorText}>Collector: {item.collector || "Unassigned"}</Text>
                  </View>
                  <View style={styles.iconRow}>
                    <TouchableOpacity onPress={() => handleViewPendingPickupStatus(item)}>
                      <Icon name="hourglass-empty" size={20} color="#333333" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("RHome")}>
          <Icon name="home" size={24} color="#5E4DCD" />
          <Text style={styles.activeNavText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("RStats")}>
          <Icon name="bar-chart" size={24} color="#666666" />
          <Text style={styles.navText}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("RProfile")}>
          <Icon name="person" size={24} color="#666666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Pickup Details Modal */}
      <Modal visible={modal1Visible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modal1Content}>
            <TouchableOpacity onPress={() => setModal1Visible(false)} style={{ alignSelf: "flex-start" }}>
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pickup details</Text>

            {selectedPickup && 'dimensions' in selectedPickup && (
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.mapWrapper}>
                  <RouteInfo initialDestination={selectedPickup.address}/>
                </View>
                <View style={styles.detailsContainer}>
                  <Text style={styles.label}><Text style={styles.bold}>Item Name:</Text> {selectedPickup.name}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Type:</Text> {selectedPickup.type}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Condition:</Text> {selectedPickup.condition}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Size:</Text> {formatDimensions(selectedPickup)}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Quantity:</Text> {selectedPickup.quantity}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Address:</Text> {selectedPickup.address}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Assign Collector Modal */}
      <Modal visible={modal2Visible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, selectedItems.length > 1 && styles.expandedModalContent]}>
            <TouchableOpacity onPress={() => {
              setModal2Visible(false);
              // Clear selections if canceling from modal
              if (multiSelectMode) {
                setSelectedItems([]);
              }
            }} style={{ alignSelf: "flex-start" }}>
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedItems.length > 1 
                ? `Assign ${selectedItems.length} Items to Collector` 
                : "Assign to"}
            </Text>
            
            {selectedItems.length > 1 && (
              <View style={styles.selectedItemsContainer}>
                <Text style={styles.selectedItemsTitle}>Selected Items:</Text>
                <ScrollView style={styles.selectedItemsList}>
                  {selectedItems.map(itemId => {
                    const item = availablePickups.find(p => p.id === itemId);
                    return item ? (
                      <View key={itemId} style={styles.selectedItemRow}>
                        <Icon name="check-circle" size={16} color="#5E4DCD" />
                        <Text style={styles.selectedItemText}>{item.name}</Text>
                      </View>
                    ) : null;
                  })}
                </ScrollView>
              </View>
            )}
            
            <Text style={styles.label}>Select Collector</Text>

            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              itemTextStyle={styles.itemTextStyle}
              data={collectors}
              labelField="label"
              valueField="value"
              placeholder="Select a collector..."
              value={selectedCollector}
              onChange={(item) => setSelectedCollector(item.value)}
            />

            <TouchableOpacity 
              style={[styles.assignButton, !selectedCollector && styles.disabledButton]} 
              onPress={handleAssignCollector} 
              disabled={!selectedCollector}
            >
              <Text style={styles.assignText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Pending Pickup Status Modal */}
      <Modal visible={modal3Visible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setModal3Visible(false)} style={{ alignSelf: "flex-start" }}>
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Pending Pickup Details</Text>

            {selectedPickup && 'pickupStatus' in selectedPickup && (
              <View>
                <View style={styles.statusContainer}>
                  {selectedPickup.pickupStatus === "Out for pickup" && (
                    <>
                      <Icon name="local-shipping" size={80} color="#5E4DCD" />
                      <Text style={styles.statusText}>Collector out for pickup</Text>
                    </>
                  )}
                  {selectedPickup.pickupStatus === "Collected" && (
                    <>
                      <Icon name="move-to-inbox" size={80} color="#F9A826" />
                      <Text style={styles.statusText}>Collector received</Text>
                    </>
                  )}
                  {selectedPickup.pickupStatus === "Recycled" && (
                    <>
                      <Icon name="check-circle-outline" size={80} color="#4CAF50" />
                      <Text style={styles.statusText}>Company received, completed pickup</Text>
                    </>
                  )}
                </View>
                <ScrollView style={{maxHeight: 250}}>
                  {selectedPickup.items.map((item, index) => (
                    <Text key={index} style={styles.label}>
                      <Text style={styles.bold}>Item {index + 1}:</Text> {item.name}
                    </Text>
                  ))}
                  <Text style={styles.label}><Text style={styles.bold}>Collector:</Text> {selectedPickup.collector || "Unassigned"}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Date:</Text> {new Date(selectedPickup.date).toLocaleDateString()}</Text>
                </ScrollView>
              </View>
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
    paddingTop: 40,
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
});

export default RHomeScreen;
