import { useState, useEffect } from 'react';
// const base_api = "http://10.100.17.243:8080/api/user";
const base_api = "http://192.168.0.183:8080/api/user";

export const updatePassword = async(
    id:number,
    pass: String
)=> {
    const response = await fetch(`${base_api}/user_donor/update/password/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            password: pass,
        }),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}
