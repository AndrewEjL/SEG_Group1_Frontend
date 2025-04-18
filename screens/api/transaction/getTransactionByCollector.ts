import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { ip_address } from "../ipAddress";
const base_api = `${ip_address}/api/transaction`;

export const useOrgCollectorItem = (id:number) => {
    const [displayOrgCollectorItem, setOrgCollectorItem] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
      
    useEffect(() => {
      const fetchOrgCollectorItem = async () => {
        try {
            const response = await fetch(`${base_api}/pickup_transaction/collector/${id}`, {
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
            setOrgCollectorItem(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
      };
        fetchOrgCollectorItem();
    }, [id]);
    return { displayOrgCollectorItem, loading};
};