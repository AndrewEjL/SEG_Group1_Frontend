import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
const base_api_user = "http://10.100.17.243:8080/api/user";
// const base_api_user = "http://192.168.0.183:8080/api/user";

export const useClient = (id: number) => {
    const [displayClient, setDisplayClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchClient = async () => {
        try {
          const response = await fetch(`${base_api_user}/user_donor/${id}`);
  
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          setDisplayClient(data);
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
  
      if (id) {
        fetchClient();
      }
    }, [id]);
  
    return { displayClient, loading };
};