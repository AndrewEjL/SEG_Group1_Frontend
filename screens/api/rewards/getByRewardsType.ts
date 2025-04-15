import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { ip_address } from "../ipAddress";
const base_api = `${ip_address}/api/rewards`;
// const base_api = "http://192.168.0.183:8080/api/rewards";

export const useAllRewardsByType = () => {
    const [displayAllRewards, setAllRewards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
      
      const fetchRewardsByType = useCallback(async (id: number) => {
        setLoading(true)
        try {
            const response = await fetch(`${base_api}/rewards/type/${id}`, {
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
      }, []);
    return { fetchRewardsByType, displayAllRewards, loading};
};