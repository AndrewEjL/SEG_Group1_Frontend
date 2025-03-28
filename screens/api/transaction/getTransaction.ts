import { useState, useEffect } from "react";
import { Alert } from "react-native";
// const base_api = "http://10.100.17.243:8080/api/transaction";
const base_api = "http://192.168.0.183:8080/api/transaction";

export const useOrgItem = (id:number, orgID:number) => {
    const [displayOrgItem, setOrgItem] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
      
    useEffect(() => {
      const fetchOrgItem = async () => {
        try {
            const response = await fetch(`${base_api}/pickup_transaction/${id}/${orgID}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              
              
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
                return;
            }
        
            const data = await response.json();
            setOrgItem(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
      };
        fetchOrgItem();
    }, [id, orgID]);
    return { displayOrgItem, loading};
};