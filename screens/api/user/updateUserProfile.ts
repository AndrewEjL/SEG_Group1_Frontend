import { useState, useEffect } from 'react';
const base_api = "http://10.100.17.243:8080/api/user";
// const base_api = "http://192.168.0.183:8080/api/user";

export const updateUser = async(
    id: number,
    userName: String,
    email: String,
    phoneNumber: String
) => {
    console.log("Sending profile update:", { id, userName, email, phoneNumber });

    const response = await fetch(`${base_api}/user_donor/update/profile/${id}`, {
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

