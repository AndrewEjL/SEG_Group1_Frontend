import { useState, useEffect } from 'react';

export const useRegistrationTypes = () => {
  const [registrationTypes, setRegistrationTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegistrationTypes = async () => {
      try {
        // campus ipv4
        //const response = await fetch('http://10.100.17.243:8080/api/status/registration_type/all');
        // home
        const response = await fetch('http://192.168.0.183:8080/api/status/registration_type/all');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        setRegistrationTypes(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchRegistrationTypes();
  }, []);

  return { registrationTypes, loading};
};
