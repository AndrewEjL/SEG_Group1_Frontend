import { useState, useEffect } from 'react';
import { ip_address } from '../ipAddress';
const base_api = `${ip_address}/api/organizationStats`;

export const updateOrgStats = async(
    id: number,
    processedV: number,
    recycledV: number
) => {
    console.log("Sending update:", { id, processedV, recycledV });

    const response = await fetch(`${base_api}/organization_stats/update/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({      
            processed: processedV,
            recycled: recycledV,
        }),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
};

