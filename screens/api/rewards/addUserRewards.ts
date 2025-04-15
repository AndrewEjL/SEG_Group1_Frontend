import { useState, useEffect } from 'react';
import { ip_address } from '../ipAddress';
const base_api = `${ip_address}/api/userRewards`;

export const addRewards = async (
    userDonorID: number,
    rewardID: number,
    rewardPin: number,
): Promise<boolean> => {
    try{
        const url = `${base_api}/user_donor_rewards/add`;
        const body = JSON.stringify({
            user_donor_id: userDonorID,
            rewards_id: rewardID,
            rewards_pin: rewardPin
        });

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
        console.error("Add error:", error);
        throw error;
    }
   
};
