import { useState, useEffect } from 'react';

export const useItemTypes = () => {
  const [itemTypes, setItemTypes] = useState<string[]>([]);
  const [deviceCondition, setDeviceCondition] = useState<string[]>([]);
  const [itemsStatus, setItemStatus] = useState<string[]>([]);
  const [loadingName, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemTypesResponse, deviceConditionResponse, itemStatusResponse] = await Promise.all([
          fetch('http://10.100.17.161:8080/api/status/item_types/all'),
          fetch('http://10.100.17.161:8080/api/status/device_condition/all'),
          fetch('http://10.100.17.161:8080/api/status/item_status/all'),
          // fetch('http://192.168.0.183:8080/api/status/item_types/all'),
          // fetch('http://192.168.0.183:8080/api/status/device_condition/all'),
          // fetch('http://192.168.0.183:8080/api/status/item_status/all'),
        ]);

        if (!itemTypesResponse.ok || !deviceConditionResponse.ok || !itemStatusResponse.ok) {
          throw new Error(
            `HTTP error! Status: ${itemTypesResponse.status}, ${deviceConditionResponse.status}, ${itemStatusResponse.status}`
          );
        }

        const itemTypesData = await itemTypesResponse.json();
        const deviceConditionData = await deviceConditionResponse.json();
        const itemStatusData = await itemStatusResponse.json();

        setItemTypes(itemTypesData);
        setDeviceCondition(deviceConditionData);
        setItemStatus(itemStatusData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { itemTypes, deviceCondition, itemsStatus, loadingName };
};
