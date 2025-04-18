import { useState, useEffect } from 'react';
import { ip_address } from '../ipAddress';
const base_api = `${ip_address}/api/user`;
// const base_api = "http://192.168.0.183:8080/api/user";

export const updateUserPoint = async(
    id: number,
    rewardPoint: number
) => {
    const response = await fetch(`${base_api}/user_donor/update/rewardsPoint/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            reward_points: rewardPoint
        }),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
};

