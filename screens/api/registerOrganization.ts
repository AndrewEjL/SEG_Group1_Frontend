const base_api = "http://10.100.17.243:8080/api/organization";
// const base_api = "http://192.168.0.183:8080/api/organization";

// check email
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const url = `${base_api}/checkEmail?email=${encodeURIComponent(email)}`;
    console.log('Fetching URL:', url.toString()); 

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response Status:', response.status); 


    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response Data:', data);
    return data.exists; 
  } catch (error) {
    console.error("Error checking email:", error);
    throw error;
  }
};

// register organization
export const registerOrganization = async (
    organizationName: string,
    registrationNumber: string,
    registrationTypeID: number,
    address: string,
    email: string,
    phoneNumber: string,
  ): Promise<boolean> => {
    try {
      const url = `${base_api}/organization/add`;
      const body = JSON.stringify({
        organization_name: organizationName,
        registration_number: registrationNumber,
        registration_type_id: registrationTypeID,
        address: address,
        email: email,
        phone_number: phoneNumber,
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
