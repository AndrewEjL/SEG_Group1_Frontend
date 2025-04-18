import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ip_address } from '../ipAddress';
const base_api_user = `${ip_address}/api/user`;

export const useAllClient = () => {
    const [displayAllClient, setDisplayAllClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchClient = async () => {
        try {
          const response = await fetch(`${base_api_user}/user_donor/all`);
  
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          setDisplayAllClient(data);
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchClient();
      
    }, []);
  
    return { displayAllClient, loading };
};