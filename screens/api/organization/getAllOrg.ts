import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ip_address } from '../ipAddress';
const base_api_user = `${ip_address}/api/organization`;

export const useAllOrganization = () => {
    const [displayAllOrg, setDisplayAllOrg] = useState<any>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchAllOrg = async () => {
        try {
          const response = await fetch(`${base_api_user}/organization/all`);
  
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          setDisplayAllOrg(data);
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchAllOrg();
      
    }, []);
  
    return { displayAllOrg, loading };
};