import { useState, useEffect } from 'react';
import { ip_address } from '../ipAddress';
const base_api = `${ip_address}/api/rewards`;

export const updateRewardsQuantity = async(
    id: number,
    quantityV: number
) => {
    const response = await fetch(`${base_api}/rewards/update/quantity/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            quantity: quantityV,
        }),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
};

