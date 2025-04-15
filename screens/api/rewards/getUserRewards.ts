import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { ip_address } from "../ipAddress";
const base_api = `${ip_address}/api/userRewards`;

export const useAllUserRewards = (id:number) => {
    const [displayUserRewards, setAllUserRewards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
      
    useEffect(() => {
      const fetchUserRewards = async () => {
        try {
            const response = await fetch(`${base_api}/user_donor_rewards/${id}`, {
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
            setAllUserRewards(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
      };
        fetchUserRewards();
    }, []);
    return { displayUserRewards, loading};
};