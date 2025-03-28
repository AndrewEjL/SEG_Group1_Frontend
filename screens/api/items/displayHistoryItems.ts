import { useState, useEffect } from "react";
// const base_api= "http://10.100.17.243:8080/api/item";
const base_api = "http://192.168.0.183:8080/api/item";

export const displayHistoryItems = (ids: number | number[]) => {
    const [displayHistoryItems, setDisplayHistoryItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
      
    useEffect(() => {
      const fetchHistoryItems = async () => {
        try {           
            // grab itemS according with item id
            // convert single ID to array for uniform processing
            const idArray = Array.isArray(ids) ? ids : [ids];
            
            // fetch all items in parallel
            const promises = idArray.map(id => 
                fetch(`${base_api}/pickup_items/getHistory/${id}`)
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
            setDisplayHistoryItems(Array.isArray(ids) ? validItems : validItems[0] || null);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
      };
      
      fetchHistoryItems();
    }, [Array.isArray(ids) ? ids.join(',') : ids]);
    
    return { 
        displayHistoryItems: Array.isArray(ids) ? displayHistoryItems : displayHistoryItems[0], 
        loading 
    };
};