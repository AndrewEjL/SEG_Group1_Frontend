import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { ip_address } from "../ipAddress";
const base_api= `${ip_address}/api/status`;
// const base_api = "http://192.168.0.183:8080/api/status";

export const useDisplayCities = () => {
  const [displayCities, setDisplayCities] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = async (id: number) => {
      setLoading(true);
      setError(null);
      try {
          const response = await fetch(`${base_api}/cities/getCities/${id}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          setDisplayCities(data);
          return data; // Return the data for immediate use
      } catch (err) {
          console.error("Fetch error:", err);          
      } finally {
          setLoading(false);
      }
  };

  return { 
      displayCities, 
      loading, 
      error, 
      fetchCities
  };
};