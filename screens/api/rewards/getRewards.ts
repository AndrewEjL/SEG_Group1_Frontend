import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { ip_address } from "../ipAddress";
const base_api = `${ip_address}/api/rewards`;
// const base_api = "http://192.168.0.183:8080/api/rewards";

export const useAllRewards = () => {
    const [displayRewards, setAllRewards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
      
    useEffect(() => {
      const fetchRewards = async () => {
        try {
            const response = await fetch(`${base_api}/rewards/all`, {
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
            setAllRewards(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
      };
        fetchRewards();
    }, []);
    return { displayRewards, loading};
};