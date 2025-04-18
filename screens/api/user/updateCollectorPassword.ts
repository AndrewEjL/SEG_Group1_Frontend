import { useState, useEffect } from 'react';
import { ip_address } from '../ipAddress';
const base_api = `${ip_address}/api/user`;

export const updateCollectorPassword = async(
    id:number,
    pass: String,
    originPass: String
)=> {
    try {
        const response = await fetch(`${base_api}/user_recipient/update/password/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                password: pass,
                originPassword: originPass
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.message || "Failed to update password";
            return { success: false, message: errorMsg };
        }

        return { success: true, message: data.message || "Password updated" };
    } catch (error) {
        return { success: false, message: "Something went wrong. Please try again later." };
    }

}
