const base_api = "http://10.100.17.161:8080/api/user";
// const base_api = "http://192.168.0.183:8080/api/user";

// check email
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const url = `${base_api}/checkEmail?email=${encodeURIComponent(email)}`;
    console.log('Fetching URL:', url.toString()); // Debugging

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response Status:', response.status); // Debugging


    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response Data:', data); // Debugging
    return data.exists; 
  } catch (error) {
    console.error("Error checking email:", error);
    throw error;
  }
};


// register user donor
export const registerUser = async (
    username: string,
    email: string,
    password: string,
    phoneNumber: string
  ): Promise<boolean> => {
    try {
      const url = `${base_api}/user_donor/add`;
      const body = JSON.stringify({
        user_name: username,
        email: email,
        password: password,
        phone_number: phoneNumber,
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
  
      console.log('Response Status:', response.status); // Debugging
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Response Data:', data); // Debugging
      return data.success;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
};