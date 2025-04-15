import { ip_address } from "./ipAddress";

const base_api = `${ip_address}/api/organizationStats`;

// register organization
export const registerOrganizationStats = async (
    organizationID: number,
  ): Promise<boolean> => {
    try {
      const url = `${base_api}/organization_stats/add`;
      const body = JSON.stringify({
        organization_id: organizationID,
      });
  
      console.log('Fetching URL:', url); 
      console.log('Request Body:', body); 
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });
  
      console.log('Response Status:', response.status); 
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Response Data:', data); 
      return data.success;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
};
