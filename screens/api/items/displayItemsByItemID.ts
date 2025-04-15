import { useState, useEffect } from "react";
import { ip_address } from "../ipAddress";
const base_api= `${ip_address}/api/item`;
// const base_api = "http://192.168.0.183:8080/api/item";

export const displayItemsByItemID = (ids: number | number[]) => {
    const [displayItems, setDisplayItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
      
    useEffect(() => {
      const fetchItems = async () => {
        try {           
            // grab itemS according with item id
            // convert single ID to array for uniform processing
            const idArray = Array.isArray(ids) ? ids : [ids];
            
            // fetch all items in parallel
            const promises = idArray.map(id => 
                fetch(`${base_api}/pickup_items/get/${id}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .catch(error => {
                        console.error(`Error fetching item ${id}:`, error);
                        return null;
                    })
            );
            
            const results = await Promise.all(promises);
            const validItems = results.filter(item => item !== null);
            setDisplayItems(Array.isArray(ids) ? validItems : validItems[0] || null);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
      };
      
      fetchItems();
    }, [Array.isArray(ids) ? ids.join(',') : ids]);
    
    return { 
        displayItems: Array.isArray(ids) ? displayItems : displayItems[0], 
        loading 
    };
};