import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { ip_address } from "../ipAddress";
const base_api= `${ip_address}/api/transaction`;

export const grabCollectorHistory = (id:number) => {
    const [displayCollectorHistory, setCollectorHistory] = useState([]);
    const [loading, setLoading] = useState(true);
      
    useEffect(() => {
      const fetchCollectorHistory = async () => {
        try {
            const response = await fetch(`${base_api}/pickup_transaction/collector/history/${id}`);
              
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
        
            const data = await response.json();
            console.log("Fetched Transactions:", data);
            setCollectorHistory(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
      };
      if (id) {
        fetchCollectorHistory();
      }
    }, [id]);
    return { displayCollectorHistory, loading};
};