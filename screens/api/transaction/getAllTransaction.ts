import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { ip_address } from "../ipAddress";
const base_api = `${ip_address}/api/transaction`;
// const base_api = "http://192.168.0.183:8080/api/transaction";

export const useAllOrgItem = () => {
    const [displayAllOrgItem, setAllOrgItem] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
      
    useEffect(() => {
      const fetchOrgItem = async () => {
        try {
            const response = await fetch(`${base_api}/pickup_transaction/all`, {
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
            setAllOrgItem(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
      };
        fetchOrgItem();
    }, []);
    return { displayAllOrgItem, loading};
};