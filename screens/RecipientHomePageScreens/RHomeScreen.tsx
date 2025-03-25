import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Dropdown } from "react-native-element-dropdown";
import RouteInfo from "./RouteInfo.tsx";

const RHomeScreen = ({ navigation }) => {

 const [availablePickups, setAvailablePickups] = useState([
  {
    id: 1,
    pickUpNo: "PICK1234",
    itemName: "S24 Ultra - Phone",
    type: "Phone",
    condition: "Partial working",
    length: "15cm",
    width: "7cm",
    height: "1cm",
    quantity: 1,
    address: "3, Eko Galleria, C0301, C0302, C0401, Blok C, Taman, Persiaran Eko Botani, 79100 Iskandar Puteri, Johor Darul Ta'zim",
  },
  {
    id: 2,
    pickUpNo: "PICK5678",
    itemName: "MacBook Pro 14",
    type: "Laptop",
    condition: "Not working",
    length: "32cm",
    width: "22cm",
    height: "2cm",
    quantity: 1,
    address: "3, Eko Galleria, C0301, C0302, C0401, Blok C, Taman, Persiaran Eko Botani, 79100 Iskandar Puteri, Johor Darul Ta'zim",
  },
  ]);

  const [pendingPickups, setPendingPickups] = useState([]);
  const [modal1Visible, setModal1Visible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [modal3Visible, setModal3Visible] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [collectors, setCollectors] = useState([]);

  useEffect(() => {
    setCollectors([
      { label: "John Doe", value: "John Doe" },
      { label: "Jane Smith", value: "Jane Smith" },
      { label: "Michael Brown", value: "Michael Brown" },
    ]);
  }, []);

  const acceptPickup = (pickup) => {
    setSelectedPickup(pickup);
    setModal2Visible(true);
  };
  const viewPickupDetails = (pickup) => {
    setSelectedPickup(pickup);
    setModal1Visible(true);
  };
  const viewPendingPickupStatus = (pickup) => {
    setSelectedPickup(pickup);
    setModal3Visible(true);
  };

  const assignCollector = () => {
    if (selectedPickup && selectedCollector) {
      setPendingPickups([...pendingPickups, { ...selectedPickup, collector: selectedCollector ,status: "Out for pickup"}]);
      setAvailablePickups(availablePickups.filter((item) => item.id !== selectedPickup.id));
      setModal2Visible(false);
      setSelectedCollector(null);
    }
  };

  const handleTabPress = (tabName) => {
      navigation.navigate(tabName)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available pickups</Text>
      <FlatList
        style={styles.flatList}
        data={availablePickups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.pickupCard}>
            <Text style={styles.itemText}>{item.itemName}</Text>
            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => viewPickupDetails(item)}>
                <Icon name="visibility" size={20} color="black" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={() => acceptPickup(item)}>
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No available pickups</Text>
            </View>
          )}
      />

      <Text style={styles.header}>Pending pickups</Text>
      <FlatList
        style={styles.flatList}
        data={pendingPickups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.pendingCard}>
            <Text style={styles.itemText}>{item.itemName}</Text>
            <Text style={styles.collectorText}>Collector: {item.collector}</Text>
            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => viewPendingPickupStatus(item)}>
                <Icon name="hourglass-empty" size={20} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No pending pickups</Text>
            </View>
          )}
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("RHome")}>
          <Icon name="home" size={24} color="#5E4DCD" />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("rewards")}>
          <Icon name="inventory" size={24} color="#666" />
          <Text style={styles.navText}>Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("RProfile")}>
          <Icon name="person" size={24} color="#666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modal1Visible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modal1Content}>
              <TouchableOpacity onPress={() => setModal1Visible(false)} style={{ alignSelf: "flex-start" }}>
                <Icon name="close" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Pickup details</Text>

             {selectedPickup && (
              <View>
              <View style={styles.mapWrapper}>
              <RouteInfo  initialDestination={selectedPickup.address}/>
              </View>
              <Text style={styles.label}><Text style={styles.bold}>Pickup No:</Text> {selectedPickup.pickUpNo}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Item Name:</Text> {selectedPickup.itemName}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Type:</Text> {selectedPickup.type}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Condition:</Text> {selectedPickup.condition}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Size:</Text> {selectedPickup.length} x {selectedPickup.width} x {selectedPickup.height}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Quantity:</Text> {selectedPickup.quantity}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Address:</Text> {selectedPickup.address}</Text>
            </View> )}
          </View>
        </View>
      </Modal>
      <Modal visible={modal2Visible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setModal2Visible(false)} style={{ alignSelf: "flex-start" }}>
              <Icon name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Assign to</Text>
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

            <TouchableOpacity style={styles.assignButton} onPress={assignCollector} disabled={!selectedCollector}>
              <Text style={styles.assignText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={modal3Visible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>

            <TouchableOpacity onPress={() => setModal3Visible(false)} style={{ alignSelf: "flex-start" }}>
              <Icon name="close" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Pending Pickup Details</Text>

            {selectedPickup && (
              <View>
                  <View style={styles.statusContainer}>
                     {selectedPickup.status === "Out for pickup" && (
                       <>
                         <Icon name="local-shipping" size={80} color="blue" />
                         <Text style={styles.statusText}>Collector out for pickup</Text>
                       </>
                     )}
                     {selectedPickup.status === "Collected" && (
                       <>
                         <Icon name="move-to-inbox" size={80} color="orange" />
                         <Text style={styles.statusText}>Collector received</Text>
                       </>
                     )}
                     {selectedPickup.status === "Recycled" && (
                       <>
                         <Icon name="check-circle-outline" size={80} color="green" />
                         <Text style={styles.statusText}>Company received, completed pickup</Text>
                       </>
                     )}
                   </View>
              <Text style={styles.label}><Text style={styles.bold}>Pickup No:</Text> {selectedPickup.pickUpNo}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Item Name:</Text> {selectedPickup.itemName}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Type:</Text> {selectedPickup.type}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Condition:</Text> {selectedPickup.condition}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Size:</Text> {selectedPickup.length} x {selectedPickup.width} x {selectedPickup.height}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Quantity:</Text> {selectedPickup.quantity}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Address:</Text> {selectedPickup.address}</Text>
              </View>
            )}

          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: "white",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6a0dad",
    marginVertical: 10,
  },
  pickupCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e6e6fa",
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    minHeight: 60,
  },
  pendingCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e6e6fa",
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    minHeight: 60,
  },
  itemText: {
    fontSize: 16,
  },
  collectorText: {
    fontSize: 14,
    color: "gray",
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
  },
  flatList: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    maxHeight: 300,
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
    color: "#666",
    marginTop: 4,
  },
  activeNavText: {
    color: "#5E4DCD",
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
  modal1Content: {
    maxWidth:"90%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color:"black",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    marginTop: 10 ,
    color:"black",
  },
  bold: {
    alignSelf: "flex-start",
    fontSize: 14,
    marginTop: 10 ,
    fontWeight: "bold",
    color:"black",
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
    color: "#000",
    fontSize: 16,
  },
  placeholderStyle: {
    color: "#161717",
    fontSize: 16,
  },
  selectedTextStyle: {
    color: "#2645f0",
    fontSize: 16,
  },
  inputSearchStyle: {
    color: "#000",
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
    color: "#333",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
  },
  mapWrapper: {
    height: 400,
    width: 350,
    position: 'relative',
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});

export default RHomeScreen;
