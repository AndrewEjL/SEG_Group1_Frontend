import { useState, useEffect } from 'react';
import { ip_address } from '../ipAddress';

export const useAllCollector = () => {
  const [allCollector, setAllCollector] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemUserResponse] = await Promise.all([
          fetch(`${ip_address}/api/user/user_recipient/all`),
          // fetch('http://192.168.0.183:8080/api/user/user_recipient/all'), 
        ]);

        if (!itemUserResponse.ok) {
          throw new Error(
            `HTTP error! Status: ${itemUserResponse.status}`
          );
        }

        const itemUserData = await itemUserResponse.json();

        setAllCollector(itemUserData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { allCollector, loading };
};
