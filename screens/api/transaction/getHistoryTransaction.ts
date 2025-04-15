import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { ip_address } from "../ipAddress";
const base_api = `${ip_address}/api/transaction`;
// const base_api = "http://192.168.0.183:8080/api/transaction";

export const useOrgHistoryItem = (id:number, orgID:number) => {
    const [displayOrgHistoryItem, setOrgHistoryItem] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
      
    useEffect(() => {
      const fetchOrgHistoryItem = async () => {
        try {
            const response = await fetch(`${base_api}/pickup_transaction/orgHistory/${id}/${orgID}`, {
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
            setOrgHistoryItem(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
      };
        fetchOrgHistoryItem();
    }, [id, orgID]);
    return { displayOrgHistoryItem, loading};
};