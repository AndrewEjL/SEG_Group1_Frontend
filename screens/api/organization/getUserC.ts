import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ip_address } from '../ipAddress';
const base_api_user = `${ip_address}/api/user`;

export const useUserC = (id: number) => {
    const [displayUserC, setDisplayUserC] = useState<any>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchUserC = async () => {
        try {
          const response = await fetch(`${base_api_user}/user_recipient/${id}`);
  
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          setDisplayUserC(data);
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
  
      if (id) {
        fetchUserC();
      }
    }, [id]);
  
    return { displayUserC, loading };
};