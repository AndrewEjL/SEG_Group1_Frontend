import { useState, useEffect } from 'react';
import { ip_address } from '../ipAddress';
const base_api = `${ip_address}/api/status`;

export const useItemTypes = () => {
  const [itemTypes, setItemTypes] = useState<string[]>([]);
  const [deviceCondition, setDeviceCondition] = useState<string[]>([]);
  const [itemsStatus, setItemStatus] = useState<string[]>([]);
  const [pickupStatus, setPickuoStatus] = useState<string[]>([]);
  const [statusType, setStatusType] = useState<string[]>([]);
  const [citiesT, setCities] = useState<string[]>([]);
  const [rewardsT, setRewardsT] = useState<string[]>([]);
  const [rewardsStatus, setRewardsStatus] = useState<string[]>([]);
  const [loadingName, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemTypesResponse, deviceConditionResponse, itemStatusResponse, pickupStatusResponse, statusTypeResponse, citiesTResponse, rewardsTResponse, rewardStatusResponse] = await Promise.all([
          fetch(`${base_api}/item_types/all`),
          fetch(`${base_api}/device_condition/all`),
          fetch(`${base_api}/item_status/all`),
          fetch(`${base_api}/pickup_status/all`),   
          fetch(`${base_api}/states_type/all`),
          fetch(`${base_api}/cities/all`),     
          fetch(`${base_api}/rewards_type/all`),
          fetch(`${base_api}/rewards_status/all`),          
          // fetch('http://192.168.0.183:8080/api/status/item_types/all'),
          // fetch('http://192.168.0.183:8080/api/status/device_condition/all'),
          // fetch('http://192.168.0.183:8080/api/status/item_status/all'),
          // fetch('http://192.168.0.183:8080/api/status/pickup_status/all'),
          // fetch('http://192.168.0.183:8080/api/status/states_type/all'),
          // fetch('http://192.168.0.183:8080/api/status/cities/all'),
          // fetch('http://192.168.0.183:8080/api/status/rewards_type/all')
        ]);

        if (!itemTypesResponse.ok || !deviceConditionResponse.ok || !itemStatusResponse.ok || !pickupStatusResponse.ok || !statusTypeResponse.ok || !citiesTResponse ||!rewardsTResponse || !rewardStatusResponse) {
          throw new Error(
            `HTTP error! Status: ${itemTypesResponse.status}, ${deviceConditionResponse.status}, ${itemStatusResponse.status}, ${pickupStatusResponse.status}, ${statusTypeResponse.status}, ${citiesTResponse.status}, ${rewardsTResponse.status}, ${rewardStatusResponse}`
          );
        }

        const itemTypesData = await itemTypesResponse.json();
        const deviceConditionData = await deviceConditionResponse.json();
        const itemStatusData = await itemStatusResponse.json();
        const pickupStatusData = await pickupStatusResponse.json();
        const statusTypeData = await statusTypeResponse.json();
        const citiesData = await citiesTResponse.json();
        const rewardsData = await rewardsTResponse.json();
        const rewardsStatusData = await rewardStatusResponse.json();

        setItemTypes(itemTypesData);
        setDeviceCondition(deviceConditionData);
        setItemStatus(itemStatusData);
        setPickuoStatus(pickupStatusData);
        setStatusType(statusTypeData);
        setCities(citiesData);
        setRewardsT(rewardsData);
        setRewardsStatus
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { itemTypes, deviceCondition, itemsStatus, pickupStatus, statusType, citiesT, rewardsT, rewardsStatus, loadingName };
};
