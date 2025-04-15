import { useState, useEffect } from 'react';
import { ip_address } from '../ipAddress';
const base_api = `${ip_address}/api/user`;
// const base_api = "http://192.168.0.183:8080/api/user";

export const updatePassword = async(
    id:number,
    pass: String,
    originPass: String
)=> {
    try {
        const response = await fetch(`${base_api}/user_donor/update/password/${id}`, {
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
