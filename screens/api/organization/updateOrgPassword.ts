import { useState, useEffect } from 'react';
import { ip_address } from '../ipAddress';
const base_api = `${ip_address}/api/organization`;
// const base_api = "http://192.168.0.183:8080/api/organization";

export const updateOrgPassword = async(
    id:number,
    pass: String,
    originPass: String
)=> {
    const response = await fetch(`${base_api}/organization/update/password/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            password: pass,
            originPassword: originPass 
        }),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}
