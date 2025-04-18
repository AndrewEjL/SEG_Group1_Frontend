import { useState, useEffect } from 'react';
import { ip_address } from '../ipAddress';
const base_api = `${ip_address}/api/organization`;

export const validatePass = async(
    id:number,
    password: String
)=> {
    try {
        const response = await fetch(`${base_api}/organization/validatePass/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                password
            }),
        });

        const data = await response.json();

        if (data === true) {
            return { success: true, message: "Password correct" };
        } else {
            return { success: false, message: "Please enter your original password" };
        }
    } catch (error) {
        return { success: false, message: "Network Issue" };
    }

}
