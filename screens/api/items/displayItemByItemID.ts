import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { ip_address } from "../ipAddress";
const base_api= `${ip_address}/api/item`;
// const base_api = "http://192.168.0.183:8080/api/item";

export const displayItemByItemID = (id:number) => {
    const [displayItemByID, setDisplayItemByItemID] = useState([]);
    const [loading, setLoading] = useState(true);
      
    useEffect(() => {
      const fetchItems = async () => {
        try {
            // fetech item by ID
            const response = await fetch(`${base_api}/pickup_items/get/${id}`);
              
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        
            const data = await response.json();
            setDisplayItemByItemID(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
      };
      if (id) {
        fetchItems();
      }
    }, [id]);
    return { displayItemByID, loading};
};
      
