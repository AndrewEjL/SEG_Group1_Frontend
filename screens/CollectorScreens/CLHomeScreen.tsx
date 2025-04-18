import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, SafeAreaView, Dimensions , Linking, TextInput} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Dropdown } from "react-native-element-dropdown";
import RouteInfo from "./RouteInfo.tsx";
import { useUser, ScheduledPickup } from "../../contexts/UserContext";
import { useRoute } from "@react-navigation/native";
import { NativeStackNavigationEventMap, NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useOrgCollectorItem } from "../api/transaction/getTransactionByCollector.ts";
import { Picker } from "@react-native-picker/picker";
import { useClient } from "../api/user/getClient.ts";
import { useAllClient } from "../api/user/getAllClient.ts";
import { useItemTypes } from "../api/items/itemTypes.ts";
import { displayEveryItemsWOStatus } from "../api/items/displayAllItemsWOStatus.ts";
import { useUserC } from "../api/organization/getUserC.ts";
import { updateToCollecting } from "../api/transaction/updateToCollecting.ts";
import { Item } from "react-native-paper/lib/typescript/components/Drawer/Drawer";
import { updateToCompleted } from "../api/transaction/updateToCompleted.ts";
import { updateCollectedStats } from "../api/organization/updateCollectedStats.ts";
import { updateUserPoint } from "../api/user/updateUserPoint.ts";

type RootStackParamList = {
  CLHome: { id: number };
  PickupDetails: { id:number, orgId: number};
  CLProfile: { id:number };
  CLHistory: { id:number };
};

type CLHomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CLHome'>;
};

type PickupItem = {
  pickup_transaction_id: number;
  pickup_item_id: number;
  user_donor_id: number;
  user_recipient_id: number;
  organization_id: number;
  pickup_status_id: number;
  // ... other properties
};

const CLHomeScreen: React.FC<CLHomeScreenProps> = ({ navigation }) => {
  const route = useRoute();
  const {id} = route.params;
  console.log(id)
  const { displayOrgCollectorItem, loading: loadingColletorItem } = useOrgCollectorItem(id);
  const allUserDonors = displayOrgCollectorItem.map(item => item.user_donor_id);
  const { displayAllClient, loading: loadingAllClient } = useAllClient();
  const { displayAllItemsWS, loading: loadingAllItems } = displayEveryItemsWOStatus();
  const { itemTypes, deviceCondition, pickupStatus, loadingName } = useItemTypes();
  console.log(itemTypes)
  const { displayUserC, loading: loadingUserC } = useUserC(id);
  const { user, getCollectorPickups, updatePickupStatus, updatePickup } = useUser();

  // State for pending pickups (pickups that are in progress)
  const [pendingPickups, setPendingPickups] = useState<PickupItem[]>([]);
  const [CollectingPickups, setCollectingPickups] = useState<PickupItem[]>([]);
  const [completedPickups, setCompletedPickups] = useState<PickupItem[]>([]);

  // State for UI components
  const [modal1Visible, setModal1Visible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [modal3Visible, setModal3Visible] = useState(false);
  const [modal4Visible, setModal4Visible] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<ScheduledPickup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [weightInput, setWeightInput] = useState<number>();
  const [weightError, setWeightError] = useState<string>('');

  // Get screen dimensions
  const windowHeight = Dimensions.get('window').height;

  // Calculate table height - subtract space for headers, nav, padding
  const navHeight = 60;  // Bottom nav height
  const headerHeight = 120; // Approx header section height
  const spacing = 100;  // Additional spacing for margins, padding etc.

  // Calculate each table's height
  const tableHeight = (windowHeight - headerHeight - navHeight - spacing);

  //Get Item name
  const getItem = (itemId: number) => {
    if (!itemId) return "Unassigned";
    const item = displayAllItemsWS.find((t) => t.pickup_items_id === itemId);
    return item;
  };

  const getItemName = (itemId: number) => {
    if (!itemId) return "Unassigned";
    const item = displayAllItemsWS.find((t) => t.pickup_items_id === itemId);
    return item.item_name || `Item ${itemId}`;
  };

  const getItemAddress = (itemId: number) => {
    if (!itemId) return "Unassigned";
    const itemLocation = displayAllItemsWS.find((t) => t.pickup_items_id === itemId);
    return itemLocation.pickup_location || "Unknown";
  }

  const getItemPoint = (itemId: number) => {
    if (!itemId) return "Unassigned";
    const item = displayAllItemsWS.find((t) => t.pickup_items_id === itemId);
    const itemTypeId = item?.item_type_id;

    if (!itemTypeId) return "Unknown";
    const itemPoint = itemTypes.find((t) => t.id === itemTypeId);
    return itemPoint?.pointsGain || "Unknown";
  }

  const getItemTypeName = (itemId: number) => {
    if (!itemId) return "Unassigned";
    const item = displayAllItemsWS.find((t) => t.pickup_items_id === itemId);
    const itemTypeId = item?.item_type_id;

    if (!itemTypeId) return "Unknown";
    const itemPoint = itemTypes.find((t) => t.id === itemTypeId);
    return itemPoint?.name || "Unknown";
  }

  const getDeviceConditionName = (itemId: number) => {
    if (!itemId) return "Unassigned";
    const item = displayAllItemsWS.find((t) => t.pickup_items_id === itemId);
    const itemTypeId = item?.item_type_id;

    if (!itemTypeId) return "Unknown";
    const device = deviceCondition.find((t) => t.id === itemTypeId);
    return device?.name || "Unknown";
  }
  
  // Function to get client name from clientId
  const getClientName = (clientId: number | undefined) => {
    if (!clientId) return "Unassigned";
    const client = displayAllClient.find((t) => t.id === clientId)
    return client.user_name;
  };

  // Function to get client phone from clientId
  const getClientPhone = (clientId: number | undefined) => {
    if (!clientId) return "+601234567891"; // Default fallback
    const client = displayAllClient.find((t) => t.id === clientId)
    return client.phone_number;
  };

  const getStatusName = (pickupStatusId: number | undefined) => {
    if(!pickupStatusId) return "Error";
    const pStatus = pickupStatus.find((t) => t.id === pickupStatusId)
    return pStatus?.name || "Unknown";
  }

  // Load data when component mounts and when screen comes into focus
  useEffect(() => {
    if (displayUserC && pickupStatus && displayOrgCollectorItem.length > 0) {
      loadData();
    }
  }, [displayUserC, displayOrgCollectorItem, pickupStatus]);
  

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("Loading data for collector:", displayUserC?.user_name);
      
      // Get pickups assigned to this collector
      const collectorPickups = await getCollectorPickups();
      console.log("Collector pickups:", displayOrgCollectorItem?.length);
      
      // Separate into pending and collected pickups based on pickupStatus

      const pending = displayOrgCollectorItem.filter(pickup => 
        pickup.pickup_status_id === 1 
      ) || [];

      const collecting = displayOrgCollectorItem.filter(Pickup => 
        Pickup.pickup_status_id === 2
      ) || [];
      
      const collected = displayOrgCollectorItem.filter(pickup => 
        pickup.pickup_status_id === 3
      ) || [];
      
      console.log("Pending pickups:", pending?.length);
      console.log("Collecting pickups:", collecting?.length);
      console.log("Collected pickups:", collected?.length);
      
      setPendingPickups(pending);
      setCollectingPickups(collecting)
      setCompletedPickups(collected); // We keep collected items here until weight is submitted
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load pickup data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

const handleMarkAsCollected = async (item: PickupItem) => {
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
            // // Update the pickup status to 'Collected' in UserContext
            // const success = await updatePickupStatus(pickup.id, 'Collected');
            
            // if (success) {
            //   // Update the state with the new status
            //   const updatedPickup: ScheduledPickup = { 
            //     ...pickup, 
            //     status: "Collected", // Ensure status is of the correct type
            //     pickupStatus: "Collected", 
            //     collectedTimestamp: new Date().toISOString(),
            //     date: new Date().toISOString().split('T')[0] // Update date field
            //   };
              
            //   // Update the full pickup with all updated fields
            //   updatePickup(updatedPickup);

            //   setPendingPickups(prevPickups => 
            //     prevPickups.filter(p => p.id !== pickup.id)
            //   );
              
            //   // setCompletedPickups(prevCompleted => 
            //   //   [...prevCompleted, updatedPickup]
            //   // );
              
            //   Alert.alert("Success", "Pickup has been marked as collected");
            // } else {
            //   Alert.alert("Error", "Failed to update pickup status");
            // }
            handleUpdateCollectedPickups(item);
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

const handleWeightChange = (text: number) => {
  // Regular expression: allow up to 3 decimal places
  const regex = /^\d*\.?\d{0,3}$/;

  if (regex.test(text)) {
    setWeightInput(text);
    setWeightError('');
  } else {
    setWeightError('Please enter a number with up to three decimal places');
  }
};

const handleSubmitWeight = async (pickupId: number, orgId: number, userId: number, rewardPoint: number) => {
  if (!weightInput || isNaN(Number(weightInput)) || weightError) {
    Alert.alert('Error', 'Please enter a valid weight');
    return;
  }

  const client = displayAllClient.find((t) => t.id === userId);
  const originalPoint = client?.reward_points;
  const newPoint = originalPoint + rewardPoint;

  if (selectedPickup) {
    try {
      const successUpdate1 = await updateToCompleted(pickupId, weightInput)
      const successUpdate2 = await updateCollectedStats(orgId, weightInput)
      const successUpdate3 = await updateUserPoint(userId, newPoint)
      if(successUpdate1 && successUpdate2 && successUpdate3){
        navigation.replace('CLHome', { id: id });               
        Alert.alert('Success', `Successfully submitted weight: ${weightInput} kg. Client can now claim points.`);
      }else {
        Alert.alert("Error", "Failed to update pickup status");
      }
      
    } catch (error) {
      console.error("Error updating pickup:", error);
      Alert.alert('Error', 'An error occurred while submitting weight');
    }
  }

  // Close the modal
  setModal3Visible(false);
  setWeightInput('');
};

  const handleUpdateAssign = async (pickupId: number) => {
    Alert.alert(
      "Confirm Pickup",
      "Are you sure you want to start this pickup?",
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
              const success = await updateToCollecting(pickupId);
              
              if (success) {
                navigation.replace('CLHome', { id: id });               
                Alert.alert("Success", "Pickup has been marked as collecting, please start collecting the item");
              } else {
                Alert.alert("Error", "Failed to update pickup status");
              }
            } catch (error) {
              console.error("Error updating pickup status:", error);
              Alert.alert("Error", "An error occurred while updating pickup status");
            }            
          },
        },
      ],
      { cancelable: true }
    );
  }

  const handleUpdatePendingPickupStatus = (pickup: PickupItem) => {
    setSelectedPickup(pickup);
    setModal1Visible(true);
  };

   const handleUpdateCollectedPickups = (pickup: PickupItem) => {
     setSelectedPickup(pickup);
     setModal1Visible(false);
     setModal2Visible(true);
   };

   const handleEnterWeight = (pickup: ScheduledPickup) => {
     setSelectedPickup(pickup);
     setModal2Visible(false);
     setModal3Visible(true);
   };

   const handleTabPress = (tabName: string) => {
    if(tabName === 'CLHistory'){
      navigation.navigate(tabName, {id: id});
    } else if(tabName === 'CLProfile'){
      navigation.navigate(tabName, {id: id});
    }
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

const getStatusStyle = (status: number | undefined) => {
  if (status === 1){
      return styles.statusPending;
  } else if(status === 2){
    return styles.statusCollecting;
  }else if(status === 3){
      return styles.statusCollected;
  }
};

// Add function to handle viewing pickup details
const handleViewPickup = (pickup: PickupItem) => {
  setSelectedPickup(pickup);
  setModal4Visible(true);
};

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.headerSection}>
          <Text style={styles.header}>Pending pickups</Text>
          <View style={[styles.tableContainer, { height: tableHeight }]}>
            {pendingPickups.length === 0 && CollectingPickups.length === 0 && completedPickups.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {loading ? "Loading pending pickups..." : "No pending pickups"}
                </Text>
              </View>
            ) : (
              (() => {
                const activeCollecting = CollectingPickups.length > 0 ? [CollectingPickups[0]] : [];
                const isCollecting = activeCollecting.length > 0;
                const remainingPickups = pendingPickups.filter(p => !activeCollecting.some((c) => c.pickup_transaction_id === p.pickup_transaction_id));

                const allData = [...activeCollecting, ...remainingPickups]
                return(
                  <FlatList
                    style={styles.flatList}
                    data={allData}
                    keyExtractor={(item) => item.pickup_transaction_id}
                    renderItem={({ item, index }) => (
                    <View>
                      {/* Insert separator before pending pickups */}
                      {index === activeCollecting.length && isCollecting && (
                        <View style={styles.separator}>
                          <Text style={styles.separatorText}>Other Pending Pickups</Text>
                        </View>
                      )}

                      <View style={styles.pendingCard}>
                        <TouchableOpacity 
                          style={styles.pickupInfo}
                          onPress={() => handleViewPickup(item)}
                        >
                          <Text style={styles.itemText}>
                            {getItemName(item.pickup_item_id)}
                          </Text>
                          <Text style={styles.collectorText}>
                            Client: {getClientName(item.user_donor_id)}
                          </Text>
                        </TouchableOpacity>
                      <View style={styles.iconRow}>
                        <Text style={[styles.itemStatus, getStatusStyle(item.pickup_status_id)]}>
                          {getStatusName(item.pickup_status_id)}
                        </Text>
                      <TouchableOpacity style={styles.viewButton} onPress={() => handleViewPickup(item)}>
                        <Icon name="visibility" size={20} color="#333333" />
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.acceptButton, item.pickup_status_id === 1 && isCollecting && styles.disabledButton]}
                        onPress={() => {
                          if (item.pickup_status_id == 1) {
                            handleUpdateAssign(item?.pickup_transaction_id);
                          } else if(item.pickup_status_id === 2) {
                            handleUpdatePendingPickupStatus(item);
                            // handleUpdateCollectedPickups(item);
                          }
                        }}
                        disabled={item.pickup_status_id === 1 && isCollecting}
                      >
                        
                      <Text style={styles.acceptText}>
                        {item.pickup_status_id === 1 ? "Pickup"
                          : item.pickup_status_id === 2 ? "Update"
                          : "Updates"
                        }
                      </Text>
                      </TouchableOpacity>
                    </View>
                    </View>
                  </View>
                  )}
                  />
                );               
              })()
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
                  <RouteInfo initialDestination={getItemAddress(selectedPickup.pickup_item_id) || 'Default Address'} />
                </View>
                <View style={styles.detailsContainer}>
                  {selectedPickup.items && selectedPickup.items.length > 0 && (
                    <>
                      <Text style={styles.label}>
                        <Text style={styles.bold}>Item Name:</Text> {getItemName(selectedPickup.pickup_item_id)}
                      </Text>
                    </>
                  )}
                  {/* <Text style={styles.label}><Text style={styles.bold}>Facility:</Text></Text> */}
                  <Text style={styles.label}><Text style={styles.bold}>Address:</Text> {getItemAddress(selectedPickup.pickup_item_id) || 'Address not available'}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Client:</Text> {getClientName(selectedPickup.user_donor_id)}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Client contact number:</Text>
                      <TouchableOpacity onPress={() => handleCall(getClientPhone(selectedPickup.user_donor_id))} style={styles.touchable} >
                        <Text style={styles.phonelabel}>{getClientPhone(selectedPickup.user_donor_id)}</Text>
                      </TouchableOpacity>
                  </Text>
                </View>
              </ScrollView>
            )}
              <TouchableOpacity style={styles.assignButton} onPress={() => handleMarkAsCollected(selectedPickup!)}>
                <Text style={styles.acceptText}>Marked as completed</Text>
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
                        <Text style={styles.bold}>Item Name:</Text> {getItemName(selectedPickup.pickup_item_id)}
                      </Text>
                    </>
                  )}
                  {/* <Text style={styles.label}><Text style={styles.bold}>Facility:</Text></Text> */}
                  <Text style={styles.label}>
                    <Text style={styles.bold}>Item Name:</Text> {getItemName(selectedPickup.pickup_item_id)}
                  </Text>
                  <Text style={styles.label}><Text style={styles.bold}>Address:</Text> {getItemAddress(selectedPickup.pickup_item_id) || 'Address not available'}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Client:</Text> {getClientName(selectedPickup.user_donor_id)}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Client contact number:</Text>{getClientPhone(selectedPickup.user_donor_id)}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Collected Time:</Text> {new Date().toLocaleString('en-MY', {timeZone: 'Asia/Kuala_Lumpur'})} </Text>
                </View>
              </ScrollView>
            )}
              {/* <TouchableOpacity style={styles.assignButton} onPress={() => handleEnterWeight(selectedPickup!)}>
                <Text style={styles.acceptText}>Enter the weight of the item</Text>
              </TouchableOpacity> */}
              <View style={styles.separator}>
                <TextInput
                style={styles.input}
                placeholder="Weight (kg)"
                onChangeText={handleWeightChange}
                placeholderTextColor="#999999"
              />
              {weightError ? <Text style={styles.errorText}>{weightError}</Text> : <Text style={styles.hintText}>Unit is kilogram (kg), allow up to 3 decimal places</Text>}
                <TouchableOpacity style={[styles.assignButton, weightError !== '' ? styles.disabledButton : null]} onPress={() => handleSubmitWeight(selectedPickup?.pickup_transaction_id, selectedPickup?.organization_id, selectedPickup?.user_donor_id, getItemPoint(selectedPickup?.pickup_item_id))} disabled={weightError !== ''}>
                  <Text style={styles.acceptText}>Submit</Text>
                </TouchableOpacity>
              </View>             
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
              <TouchableOpacity style={[styles.assignButton, weightError !== '' ? styles.disabledButton : null]} onPress={() => handleSubmitWeight(selectedPickup?.pickup_transaction_id, selectedPickup?.organization_id)} disabled={weightError !== ''}>
                <Text style={styles.acceptText}>Submit</Text>
              </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Pickups details Modal*/}
      <Modal visible={modal4Visible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modal1Content}>
            <TouchableOpacity onPress={() => setModal4Visible(false)} style={{ alignSelf: "flex-start" }}>
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pickup details</Text>

            {selectedPickup && (
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.detailsContainer}>      
                <View style={styles.separatorBottom}>
                  <Text style={styles.label}><Text style={styles.bold}>Client:</Text> {getClientName(selectedPickup.user_donor_id)}</Text>           
                </View> 
                
                  {/* <Text style={styles.label}><Text style={styles.bold}>Facility:</Text></Text> */}
                  <Text style={styles.label}>
                    <Text style={styles.bold}>Item: </Text> {getItemName(selectedPickup.pickup_item_id)}
                  </Text>
                  <Text style={styles.label}><Text style={styles.bold}>Device & Condition: </Text> {getItemTypeName(selectedPickup.pickup_item_id)} • {getDeviceConditionName(selectedPickup.pickup_item_id)}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Dimension:</Text>{getItem(selectedPickup.pickup_item_id)?.dimension_length}×{getItem(selectedPickup.pickup_item_id)?.dimension_width}×{getItem(selectedPickup.pickup_item_id)?.dimension_height}</Text>
                  <Text style={styles.label}><Text style={styles.bold}>Address:</Text> {getItemAddress(selectedPickup.pickup_item_id)} </Text>
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

statusCollecting: {
  color: '#5E4DCD',
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
  viewButton: {
    padding: 5,
    marginRight: 5,
  },
  separator: {
    marginVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 5,
    alignItems: "center",
  },
  separatorBottom: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 5,
    alignItems: "center",
  },
  separatorText: {
    color: "#888",
    fontSize: 12,
    fontStyle: "italic",
  },
  // disabledButton: {
  //   backgroundColor: "#ccc",
  //   opacity: 0.6,
  // },
});

export default CLHomeScreen;

