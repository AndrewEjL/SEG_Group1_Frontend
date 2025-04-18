import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ip_address } from '../ipAddress';
const base_api_user = `${ip_address}/api/user`;
// const base_api_user = "http://192.168.0.183:8080/api/user";

export const generateCode = () => {
    const [generate1Code, setDisplayCode] = useState<any>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchCode = async () => {
        try {
          const response = await fetch(`${base_api_user}/generateCode`);
  
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          setDisplayCode(data);
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
        fetchCode();
    }, []);
  
    return { generate1Code, loading };
};