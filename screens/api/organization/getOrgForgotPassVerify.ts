import { useState } from 'react';
import { ip_address } from '../ipAddress';
import { Alert } from 'react-native';

const base_api_user = `${ip_address}/api/organization`;

export const useOrgVerify = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const verifyOrgEmailCode = async (emailV: String, codeV: String) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const url = `${base_api_user}/sendCode`;
      const body = JSON.stringify({
        email: emailV,
        code: codeV,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      const responseText = await response.text();
      console.log('Raw Response:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Check the message from the backend
      if (responseText === 'Code sent') {
        setLoading(false);
        setSuccess(true);
        Alert.alert("Success", "A verification code has been sent to your email.");
      } else {
        setLoading(false);
        setError('Failed to resend verification code.');
        Alert.alert("Error", "Failed to resend verification code.");
      }
    } catch (err) {
      console.log('Fetch error:', err);
      setLoading(false);
      setError('An error occurred while verifying the code.');
      Alert.alert("Error", "An error occurred while verifying the code.");
    }
  };

  return { verifyOrgEmailCode, loading, error, success };
};

