import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
// const base_api_user = "http://10.100.17.243:8080/api/user";
// const base_api_organization = "http://10.100.17.243:8080/api/organization";
const base_api_user = "http://192.168.0.183:8080/api/user";
const base_api_organization = "http://192.168.0.183:8080/api/organization";

export const login = async (email: String, pass: String) => {
    try {
        const endpoints = [
            { url: `${base_api_user}/user_donor/login`, userType: "donor" },
            { url: `${base_api_user}/user_recipient/login`, userType: "recipient" },
            { url: `${base_api_organization}/organization/login`, userType: "organization" }
        ];

        for (const endpoint of endpoints) {
            const response = await fetch(endpoint.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass }),
            });

            console.log(`Trying: ${endpoint.url}, Status: ${response.status}`);

            if (response.ok) {
                const data = await response.json();
                console.log("Login Success:", data);  
                return { success: true, id: data.id, userType: endpoint.userType };
            } else {
                console.log(`Failed at ${endpoint.url}, Response:`, await response.text());
            }
        }

        console.log("Invalid credentials: No matching account found.");
        return { success: false };
    } catch (error) {
        console.error("Login Error:", error);
        return { success: false, error };
    }
};

