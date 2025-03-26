import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useUser, type ListedItem } from '../contexts/UserContext';
import { useItemTypes } from './api/items/itemTypes';
import { displayItemByItemID } from './api/items/displayItemByItemID';
import { updateItem } from './api/items/updateItem';

type RootStackParamList = {
  Home: {id: number};
  EditListedItems: { userDonorID: number };
  EditLocation: { itemId: number; currentAddress: number };
};

type EditListedItemsProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditListedItems'>;
  route: RouteProp<RootStackParamList, 'EditListedItems'>;
};

const EditListedItems: React.FC<EditListedItemsProps> = ({ navigation, route }) => {
  const { itemId, id } = route.params;
  const { getListedItems, updateListedItem } = useUser();
  const { displayItemByID, loading } = displayItemByItemID(itemId);
  const { itemTypes, deviceCondition, loadingName } = useItemTypes();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userDonorID, setUserDonorID] =  useState<number>(0)
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState<number | null>(null);
  const [condition, setCondition] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: ''
  });
  const [quantity, setQuantity] = useState('');
  const [address, setAddress] = useState('');

  // Load item data when component mounts
  useEffect(() => {
    if(displayItemByID){
      const item = displayItemByID;
      setUserDonorID(item.user_donor_id || 0);
      setItemName(item.item_name);
      setItemType(item.item_type_id || 'Select Type');
      setCondition(item.device_condition_id);
      setDimensions({
        length: item.dimension_length?.toString() || '',
        width: item.dimension_width?.toString() || '',
        height: item.dimension_height?.toString() || ''
      });
      setAddress(item.pickup_location || '');
      setIsLoading(false);
    }
  }, [displayItemByID]);

  const handleDimensionChange = (value: string, dimension: 'length' | 'width' | 'height') => {
    // Only allow numbers and limit to 3 digits
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 3) {
      setDimensions(prev => ({
        ...prev,
        [dimension]: numericValue
      }));
    }
  };

  // const handleQuantityChange = (value: string) => {
  //   // Only allow numbers and limit to 20
  //   const numericValue = value.replace(/[^0-9]/g, '');
  //   const numberValue = parseInt(numericValue || '0', 10);
  //   if (numberValue <= 20) {
  //     setQuantity(numericValue);
  //   }
  // };

  const handleUpdate = async () => {
    // Basic validation
    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }
    if (!itemType) {
      Alert.alert('Error', 'Please select item type');
      return;
    }
    if (!deviceCondition) {
      Alert.alert('Error', 'Please select condition');
      return;
    }
    if (!dimensions.length || !dimensions.width || !dimensions.height) {
      Alert.alert('Error', 'Please enter all dimensions');
      return;
    }
    if (!address) {
      Alert.alert('Error', 'Please set a location for the item');
      return;
    }

    setIsSaving(true);
    
    try {
      const updatedItem = {
        item_name: itemName,
        item_type_id: itemType,
        device_condition_id: condition,
        dimension_length: parseFloat(dimensions.length),
        dimension_width: parseFloat(dimensions.width),
        dimension_height: parseFloat(dimensions.height),
        pickup_location: address,
      };
      console.log(itemName);
      const success = await updateItem(userDonorID, displayItemByID.item_name, updatedItem);

      if (success) {
        console.log(id)
        navigation.navigate('Home', {id});
      } else {
        setError('Failed to update item');
      }
    } catch (err) {
      console.error('Error updating item:', err);
      setError('An error occurred while updating the item');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5E4DCD" />
        <Text style={styles.loadingText}>Loading item data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Item</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )} */}
        
        {displayItemByID && (
          <>
           {/* Item Name */}
           <View style={styles.inputContainer}>
              <Text style={styles.label}>Item Name</Text>
              <TextInput
                style={[styles.input, { color: '#000', textAlign: 'left' }]}
                placeholder="Enter item name"
                placeholderTextColor="#666"
                value={itemName}
                onChangeText={setItemName}
              />
            </View>

            {/* Item Type Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Item Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={itemType}
                  onValueChange={(value) => setItemType(value)}
                  style={styles.picker}
                  dropdownIconColor="#666"
                  mode="dropdown"
                  enabled={true}
                  itemStyle={{ backgroundColor: '#FFFFFF' }}
                >
                  <Picker.Item 
                    label="Select Type" 
                    value="Select Type" 
                    color={itemType === "Select Type" ? "#666" : "#000"}
                    style={{ backgroundColor: '#FFFFFF' }}
                  />
                  {itemTypes.map((type) => (
                    <Picker.Item 
                      key={type.id} 
                      label={type.name} 
                      value={type.id}
                      color="#000"
                      style={{ backgroundColor: '#FFFFFF' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Condition Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Condition</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={condition}
                  onValueChange={(value) => setCondition(value)}
                  style={styles.picker}
                  dropdownIconColor="#666"
                  mode="dropdown"
                  enabled={true}
                  itemStyle={{ backgroundColor: '#FFFFFF' }}
                >
                  <Picker.Item 
                    label="Select Condition" 
                    value="Select Condition" 
                    color={condition === "Select Condition" ? "#666" : "#000"}
                    style={{ backgroundColor: '#FFFFFF' }}
                  />
                  {deviceCondition.map((cond) => (
                    <Picker.Item 
                      key={cond.id} 
                      label={cond.name} 
                      value={cond.id}
                      color="#000"
                      style={{ backgroundColor: '#FFFFFF' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Dimensions */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Dimensions</Text>
              <Text style={styles.sublabel}>(in centimeters)</Text>
              <View style={styles.dimensionsContainer}>
                <View style={styles.dimensionInput}>
                  <TextInput
                    style={[styles.input, { color: '#000' }]}
                    placeholder="L"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={dimensions.length}
                    onChangeText={(value) => handleDimensionChange(value, 'length')}
                  />
                  <Text style={styles.dimensionLabel}>Length</Text>
                </View>
                <Text style={styles.dimensionX}>×</Text>
                <View style={styles.dimensionInput}>
                  <TextInput
                    style={[styles.input, { color: '#000' }]}
                    placeholder="W"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={dimensions.width}
                    onChangeText={(value) => handleDimensionChange(value, 'width')}
                  />
                  <Text style={styles.dimensionLabel}>Width</Text>
                </View>
                <Text style={styles.dimensionX}>×</Text>
                <View style={styles.dimensionInput}>
                  <TextInput
                    style={[styles.input, { color: '#000' }]}
                    placeholder="H"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={dimensions.height}
                    onChangeText={(value) => handleDimensionChange(value, 'height')}
                  />
                  <Text style={styles.dimensionLabel}>Height</Text>
                </View>
              </View>
            </View>

            {/* Quantity
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Quantity</Text>
              <Text style={styles.sublabel}>(maximum 20)</Text>
              <TextInput
                style={[styles.input, styles.quantityInput, { color: '#000' }]}
                placeholder="1"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={quantity}
                onChangeText={handleQuantityChange}
              />
            </View> */}

            {/* Location */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.locationContainer}>
                <Text style={styles.addressText} numberOfLines={2} ellipsizeMode="tail">
                  {address || 'No location set'}
                </Text>
                <TouchableOpacity 
                  style={styles.editLocationButton}
                  onPress={() => navigation.navigate('EditLocation', { itemId, currentAddress: address })}
                >
                  <Text style={styles.editLocationButtonText}>Edit Location</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Update Button */}
            <TouchableOpacity 
              style={styles.listButton}
              onPress={handleUpdate}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.listButtonText}>Edit Item</Text>
              )}
            </TouchableOpacity>
            
            {/* Add padding at the bottom for better scrolling */}
            <View style={styles.bottomPadding} />
          
          </>
        )}                 
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  bottomPadding: {
    height: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 12,
    color: '#666',
    marginTop: -4,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    backgroundColor: '#FFFFFF',
  },
  dimensionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dimensionInput: {
    flex: 1,
    alignItems: 'center',
  },
  dimensionX: {
    fontSize: 20,
    color: '#666',
    marginHorizontal: 8,
  },
  dimensionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    backgroundColor: '#F5F5F5',
    textAlign: 'center',
  },
  quantityInput: {
    width: '30%',
  },
  listButton: {
    backgroundColor: '#5E4DCD',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  listButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  locationContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  editLocationButton: {
    backgroundColor: '#5E4DCD',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  editLocationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default EditListedItems; 