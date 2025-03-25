import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useItemTypes } from './api/items/itemTypes';
import { useRoute } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  AddPickupItem: undefined;
  MapScreen: {
    id: number;
    itemData: {
      name: string;
      type: number;
      condition: number;
      dimensions: {
        length: string;
        width: string;
        height: string;
      };
      quantity: string;
    };
  };
};

type AddPickupItemScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddPickupItem'>;
  route: any;
};

const AddPickupItemScreen: React.FC<AddPickupItemScreenProps> = ({ navigation }) => {
  const route = useRoute();
  const {id} = route.params || {};
  const {itemTypes, deviceCondition, loadingName } = useItemTypes();
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState<number | null>(null);
  const [condition, setCondition] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: ''
  });
  const [quantity, setQuantity] = useState('');

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

  const handleQuantityChange = (value: string) => {
    // Only allow numbers and limit to 20
    const numericValue = value.replace(/[^0-9]/g, '');
    const numberValue = parseInt(numericValue || '0', 10);
    if (numberValue <= 20) {
      setQuantity(numericValue);
    }
  };

  const handleProceed = () => {
    // Basic validation
    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }
    if (!itemType) {
      Alert.alert('Error', 'Please select item type');
      return;
    }

    if (!condition) {
      Alert.alert('Error', 'Please select condition');
      return;
    }
    if (!dimensions.length || !dimensions.width || !dimensions.height) {
      Alert.alert('Error', 'Please enter all dimensions');
      return;
    }
    if (!quantity) {
      Alert.alert('Error', 'Please enter quantity');
      return;
    }

    navigation.navigate('MapScreen', {
      id,
      itemData: {
        name: itemName,
        type: itemType,
        condition: condition,
        dimensions,
        quantity
      },
    });
    
  };

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
        <Text style={styles.title}>List Item</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
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
                value="" 
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
                value="" 
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

        {/* Quantity */}
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
        </View>

        {/* Proceed Button */}
        <TouchableOpacity 
          style={styles.listButton}
          onPress={handleProceed}
        >
          <Text style={styles.listButtonText}>Proceed</Text>
        </TouchableOpacity>

        {/* Add padding at the bottom for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
});

export default AddPickupItemScreen; 