import { useState, useEffect } from 'react';
import { ip_address } from '../ipAddress';
const base_api = `${ip_address}/api/organization`;
// const base_api = "http://192.168.0.183:8080/api/organization";

export const updateOrg = async(
    id: number,
    email: String,
    phoneNumber: String,
    address: String
) => {
    console.log("Sending profile update:", { id, email, phoneNumber, address });

    const response = await fetch(`${base_api}/organization/update/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({      
            email: email,
            phone_number: phoneNumber,
            address: address,
        }),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
};

