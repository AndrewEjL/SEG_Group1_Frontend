import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { ip_address } from "../ipAddress";
const base_api= `${ip_address}/api/transaction`;
// const base_api = "http://192.168.0.183:8080/api/transaction";

export const grabTransactionOrg = (id:number) => {
    const [displayTransactionOrg, setTransaction] = useState([]);
    const [loadingT1, setLoading] = useState(true);
      
    useEffect(() => {
      const fetchTransactionOrg = async () => {
        try {
            const response = await fetch(`${base_api}/pickup_transaction/distinctOrg/${id}`);
              
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        
            const data = await response.json();
            console.log("Fetched Transactions:", data);
            setTransaction(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
      };
      if (id) {
        fetchTransactionOrg();
      }
    }, [id]);
    return { displayTransactionOrg, loadingT1};
};