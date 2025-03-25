import { useState, useEffect } from 'react';
const base_api = "http://10.100.17.161:8080/api/item";
// const base_api = "http://192.168.0.183:8080/api/item";

export const addItem = async (
    userDonorID: number,
    itemName: string,
    itemTypeID: number,
    deviceConditionID: number,
    dimensionLength: number,
    dimensionWidth: number,
    dimensionHeight: number,
    pickupLocation: String
): Promise<boolean> => {
    try{
        const url = `${base_api}/pickup_items/add`;
        const body = JSON.stringify({
            user_donor_id: userDonorID,
            item_name: itemName,
            item_type_id: itemTypeID,
            device_condition_id: deviceConditionID,
            dimension_length: dimensionLength,
            dimension_width: dimensionWidth,
            dimension_height: dimensionHeight,
            pickup_location: pickupLocation,
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: body,
        });
        console.log('Response Status:', response.status); 
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        console.log('Response Data:', data); 
        return data.success;
    } catch (error) {
        console.error("Add error:", error);
        throw error;
    }
   
};
