import { useState, useEffect } from "react";
import { Alert } from "react-native";
const base_api = "http://10.100.17.243:8080/api/organization";
// const base_api = "http://192.168.0.183:8080/api/organization";

export const useOrganization = () => {
    const [displayOrg, setOrg] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
      
    useEffect(() => {
      const fetchOrg = async () => {
        try {
            const response = await fetch(`${base_api}/organization/all`);
              
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        
            const data = await response.json();
            setOrg(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
      };
        fetchOrg();
    }, []);
    return { displayOrg, loading};
};