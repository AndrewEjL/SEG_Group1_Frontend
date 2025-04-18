import { useState, useEffect } from 'react';
import { ip_address } from '../ipAddress';
const base_api = `${ip_address}/api/transaction`;

export const updateToCancel = async(
    id: number,
    weightV: number
) => {
    const response = await fetch(`${base_api}/pickup_transaction/update/status/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            pickup_status_id: 4,
            weight: weightV
        }),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
};

