import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ip_address } from '../ipAddress';
const base_api_user = `${ip_address}/api/organizationStats`;

export const useOrganizationStatsByID = (id: number) => {
    const [displayOrgStats, setDisplayOrgStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchOrgStats = async () => {
        try {
          const response = await fetch(`${base_api_user}/organization_stats/${id}`);
  
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          setDisplayOrgStats(data);
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
  
      if (id) {
        fetchOrgStats();
      }
    }, [id]);
  
    return { displayOrgStats, loading };
};