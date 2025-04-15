import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ip_address } from '../ipAddress';
const base_api_user = `${ip_address}/api/user`;
// const base_api_user = "http://192.168.0.183:8080/api/user";

export const useCollector = (id: number) => {
    const [displayCollector, setDisplayCollector] = useState<any>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchCollector = async () => {
        try {
          const response = await fetch(`${base_api_user}/user_recipient/org/${id}`);
  
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          setDisplayCollector(data);
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
  
      if (id) {
        fetchCollector();
      }
    }, [id]);
  
    return { displayCollector, loading };
};