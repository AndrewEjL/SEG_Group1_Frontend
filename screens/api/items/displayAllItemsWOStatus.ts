import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { ip_address } from "../ipAddress";
const base_api= `${ip_address}/api/item`;
// const base_api = "http://192.168.0.183:8080/api/item";

export const displayEveryItemsWOStatus = () => {
    const [displayAllItemsWS, setDisplayAllItemsWS] = useState<any>([]);
    const [loading, setLoading] = useState(true);
      
    useEffect(() => {
      const fetchAllItems = async () => {
        try {
          // with user id
            const response = await fetch(`${base_api}/pickup_items/allWStatus`);
              
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        
            const data = await response.json();
            setDisplayAllItemsWS(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
      };
      
      fetchAllItems();
    }, []);
    return { displayAllItemsWS, loading};
};
      
