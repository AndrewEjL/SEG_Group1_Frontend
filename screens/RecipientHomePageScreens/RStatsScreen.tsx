import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert, Modal , StyleSheet} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import MenuIcon from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useOrganizationStatsByID } from "../api/organization/getOrgStats";
import { updateOrgStats } from "../api/organization/updateOrgStats";

type RootStackParamList = {
  RHome: {id:number};
  RStats: {id:number};
  RProfile: {id:number};
  CollectorList: {id:number};
  // Add other screens as needed
};

type RStatsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RStats'>;
};

const RStatsScreen: React.FC<RStatsScreenProps> = ({navigation}) => {
  const route = useRoute();
  const {id} = route.params;
  const { displayOrgStats, loading: loadingOrgStats } = useOrganizationStatsByID(id);
  console.log(displayOrgStats);
  const [collected, setCollected] = useState(365.0);
  const [processed, setProcessed] = useState(0.0);
  const [recycled, setRecycled] = useState(0.0);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputValue, setInputValue] = useState("");


  const handleUpdate = () => {
    let value = parseFloat(inputValue);
    if (isNaN(value) || value < 0) {
      Alert.alert("Invalid input", "Please enter a valid number.");
      return;
    }


    if (selectedOption === "processed" && (value + displayOrgStats?.processed) > displayOrgStats?.collected) {
      Alert.alert("Error", "Processed cannot be greater than Collected.");
      return;
    }
    if (selectedOption === "recycled" && (value + displayOrgStats?.recycled) > displayOrgStats?.processed) {
      Alert.alert("Error", "Recycled cannot be greater than Processed.");
      return;
    }

    if (selectedOption === "processed") {
      updateOrgStats(id, value, 0);
      navigation.replace('RStats', {id: id});
    } else if (selectedOption === "recycled") {
      updateOrgStats(id, 0, value);
      navigation.replace('RStats', {id: id});
    }
    setInputValue("");
    setSelectedOption(null);
    setModalVisible(false);
  };

  const dropdownData = [
    { label: "Add Processed", value: "processed" },
    { label: "Add Recycled", value: "recycled" }
  ];

  const handleTabPress = (tabName: keyof RootStackParamList) => {
      navigation.navigate(tabName, {id:id})
  };

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { borderColor: "red" }]}>
        <Text style={styles.statText}>{displayOrgStats?.collected} kg</Text>
        <Text style={styles.desText}>Collected</Text>
      </View>
      <View style={[styles.circle, { borderColor: "orange" }]}>
        <Text style={styles.statText}>{displayOrgStats?.processed} kg</Text>
        <Text style={styles.desText}>Processed</Text>
      </View>
      <View style={[styles.circle, { borderColor: "green" }]}>
        <Text style={styles.statText}>{displayOrgStats?.recycled} kg</Text>
        <Text style={styles.desText}>Recycled</Text>
      </View>

      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.updateButton}>
        <Text style={styles.updateButtonText}>Update</Text>
      </TouchableOpacity>
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("RHome")}>
          <MenuIcon name="home" size={24} color="#666" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("RStats")}>
          <MenuIcon name="bar-chart" size={24} color="#5E4DCD" />
          <Text style={styles.activeNavText}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("RProfile")}>
          <MenuIcon name="person" size={24} color="#666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>


      <Modal
         animationType="slide"
         transparent={true}
         visible={modalVisible}
         onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
         <View style={styles.modalContent}>
             <TouchableOpacity onPress={() => {setModalVisible(false);setInputValue("");setSelectedOption(null);}} style={{ alignSelf: "flex-start" }}>
               <Icon name="close" size={24} color="black" />
             </TouchableOpacity>
          <Text style={styles.modalTitle}>Update Stats</Text>

          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            itemTextStyle={styles.itemTextStyle}
            data={dropdownData}
            labelField="label"
            valueField="value"
            placeholder="Select an option..."
            value={selectedOption}
            onChange={(item) => setSelectedOption(item.value)}
          />

          {selectedOption && (
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter the amount to add (kg)"
              value={inputValue}
              onChangeText={(text) => {
                if (/^\d*\.?\d{0,2}$/.test(text)) {
                  setInputValue(text);
                }
              }}
            />
          )}
         <View style={styles.modalButtons}>
          <TouchableOpacity onPress={handleUpdate} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
         </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-starts",
    backgroundColor: "white",
    paddingTop: 100,
  },
  circle: {
    width: 150,
    height: 150,
    borderWidth: 5,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginBottom: 30,
  },
  statText: {
    fontSize: 20,
    fontWeight: "bold",
    color:"black",
  },
  desText: {
    fontSize: 15,
    color:"black",
  },
  updateButton: {
      backgroundColor: "#5E4DCD",
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 20,
      alignItems: "center",
      marginTop: 20,
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 30, color: "black",marginTop: 20, },
  dropdown: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 30,
  },
  confirmButton: {
    backgroundColor: "#5E4DCD",
    padding: 10,
    borderRadius: 20,
    width: "40%",
    alignItems: "center",
    marginRight: 5,

  },
  confirmButtonText: {
    color: "white",
    textAlign: "center",
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
    fontSize: 14,
  },

});

export default RStatsScreen;
