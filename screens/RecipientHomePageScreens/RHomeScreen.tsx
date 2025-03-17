import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import RNPickerSelect from "react-native-picker-select";

const PickupsScreen = () => {
  const [availablePickups, setAvailablePickups] = useState([
    { id: 1, itemName: "S24 Ultra - Phone" },
  ]);
  const [pendingPickups, setPendingPickups] = useState([
    { id: 2, itemName: "S24 - Phone", collector: "XXXX" },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
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
    setModalVisible(true);
  };

  const assignCollector = () => {
    if (selectedPickup && selectedCollector) {
      setPendingPickups([...pendingPickups, { ...selectedPickup, collector: selectedCollector }]);
      setAvailablePickups(availablePickups.filter((item) => item.id !== selectedPickup.id));
      setModalVisible(false);
      setSelectedCollector(null);
    }
  };

  const handleTabPress = (tabName) => {
    console.log("Pressed tab:", tabName);
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
              <TouchableOpacity>
                <Icon name="visibility" size={20} color="black" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={() => acceptPickup(item)}>
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
            </View>
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
              <TouchableOpacity style={{ marginRight: 10 }}>
                <Icon name="visibility" size={20} color="black" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Icon name="shopping-cart" size={20} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("home")}>
          <Icon name="home" size={24} color="#5E4DCD" />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("rewards")}>
          <Icon name="inventory" size={24} color="#666" />
          <Text style={styles.navText}>Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("profile")}>
          <Icon name="person" size={24} color="#666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Assign to</Text>
            <Text style={styles.label}>Select Collector</Text>

            <RNPickerSelect
              onValueChange={(value) => setSelectedCollector(value)}
              items={collectors}
              placeholder={{ label: "Select a collector...", value: null }}
            />

            <TouchableOpacity style={styles.assignButton} onPress={assignCollector} disabled={!selectedCollector}>
              <Text style={styles.assignText}>Confirm</Text>
            </TouchableOpacity>
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    marginBottom: 5,
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
  picker: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: "100%",
    textAlign: "center",
  },
});
