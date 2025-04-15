import { useState, useEffect } from 'react';
import { ip_address } from '../ipAddress';
const base_api = `${ip_address}/api/user`;

export const updateUserPoints = async(
    id: number,
    rewardPoints: number
) => {

    const response = await fetch(`${base_api}/user_donor/update/rewardsPoint/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            reward_points: rewardPoints,
        }),
    });
    console.log(rewardPoints)
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data)
    return data;
};
