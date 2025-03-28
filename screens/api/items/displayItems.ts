import { useState, useEffect } from "react";
import { Alert } from "react-native";
// const base_api= "http://10.100.17.243:8080/api/item";
const base_api = "http://192.168.0.183:8080/api/item";

export const displayItem = (id:number) => {
    const [displayItems, setDisplayItems] = useState([]);
    const [loading, setLoading] = useState(true);
      
    useEffect(() => {
      const fetchItems = async () => {
        try {
          // with user id
            const response = await fetch(`${base_api}/pickup_items/${id}`);
              
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        
            const data = await response.json();
            setDisplayItems(data);
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
    return { displayItems, loading};
};
      
