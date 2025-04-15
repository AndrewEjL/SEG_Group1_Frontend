import { ip_address } from "../ipAddress"

const base_api = `${ip_address}/api/transaction`;
// const base_api = "http://192.168.0.183:8080/api/transaction";
const base_api_status = `${ip_address}/api/item`;
// const base_api_status = "http://192.168.0.183:8080/api/item";

// register user donor
export const addTransaction = async (
  pickupItemID: number,
  userDonorID: number,
  userRecipientID: number,
  organizationID: number
  ): Promise<boolean> => {
    try {
      const url = `${base_api}/pickup_transaction/add`;
      const body = JSON.stringify({
        pickup_item_id: pickupItemID,
        user_donor_id: userDonorID,
        user_recipient_id: userRecipientID,
        organization_id: organizationID,
      });

      const url_status = `${base_api_status}/pickup_items/update/status/${pickupItemID}`
      const body_status = JSON.stringify({
        item_status_id: 2,
      });
  
      console.log('Fetching URL:', url); // Debugging
      console.log('Request Body:', body); // Debugging
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });
      
      if (!response.ok) {
        throw new Error(`Transaction failed: ${response.status}`);
      }

      const response_status = await fetch(url_status, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body_status,
      });
    
      if (!response_status.ok) {
        throw new Error(`Status update failed: ${response_status.status}`);
      }
  
      const data = await response.json();
      const data_status = await response_status.json();
      console.log('Response Data:', data); // Debugging
      return data.success && data_status.success;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
};