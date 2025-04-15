import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ip_address } from '../ipAddress';
const base_api_user = `${ip_address}/api/organization`;
// const base_api_user = "http://192.168.0.183:8080/api/organization";

export const useOrganizationByID = (id: number) => {
    const [displayOrg, setDisplayOrg] = useState<any>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchOrg = async () => {
        try {
          const response = await fetch(`${base_api_user}/organization/${id}`);
  
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          setDisplayOrg(data);
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
  
      if (id) {
        fetchOrg();
      }
    }, [id]);
  
    return { displayOrg, loading };
};