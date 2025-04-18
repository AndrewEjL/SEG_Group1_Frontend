import { useState, useEffect } from 'react';
import { ip_address } from '../ipAddress';
const base_api = `${ip_address}/api/organization`;

export const resetOrgPassword = async(
    email: String,
    pass: String
)=> {
    try {
        const response = await fetch(`${base_api}/reset`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                newPass: pass,
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
