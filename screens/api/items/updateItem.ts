import { useState, useEffect } from 'react';
const base_api = "http://10.100.17.161:8080/api/item";
//const base_api = "http://192.168.0.183:8080/api/item";

export const updateItem = async (
    id:number,
    updateData: any
)=> {
    try{
        const response = await fetch(`${base_api}/pickup_items/update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Add error:", error);
        throw error;
    }
   
};
