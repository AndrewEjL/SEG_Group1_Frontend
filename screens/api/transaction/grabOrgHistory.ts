import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { ip_address } from "../ipAddress";
const base_api= `${ip_address}/api/transaction`;
// const base_api = "http://192.168.0.183:8080/api/transaction";

export const grabOrgHistory = (id:number) => {
    const [displayOrgHistory, setOrgHistory] = useState([]);
    const [loading, setLoading] = useState(true);
      
    useEffect(() => {
      const fetchOrgHistory = async () => {
        try {
            const response = await fetch(`${base_api}/pickup_transaction/org/history/${id}`);
              
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        
            const data = await response.json();
            console.log("Fetched Transactions:", data);
            setOrgHistory(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
      };
      if (id) {
        fetchOrgHistory();
      }
    }, [id]);
    return { displayOrgHistory, loading};
};