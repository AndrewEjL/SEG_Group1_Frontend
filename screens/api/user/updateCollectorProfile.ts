import { useState, useEffect } from 'react';
import { ip_address } from '../ipAddress';
const base_api = `${ip_address}/api/user`;

export const updateCollector = async(
    id: number,
    userName: String,
    email: String,
    phoneNumber: String
) => {
    console.log("Sending profile update:", { id, userName, email, phoneNumber });

    const response = await fetch(`${base_api}/user_recipient/update/profile/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_name: userName,
            email: email,
            phone_number: phoneNumber,
        }),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
};

