import { useEffect, useState } from "react";
const base_api = "http://10.100.17.243:8080/api/item";
// const base_api = "http://192.168.0.183:8080/api/item";

export const useDeleteItem = () => {
    const [displayItems, setDisplayItems] = useState([]);
    const [loadingDelete, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteItem = async (id:number) => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${base_api}/pickup_items/delete/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          });
    
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || "Failed to delete item");
    
          return { success: true, message: data.message };
        } catch (error) {
            console.error("delete error:", error);
            throw error;
        }
      };
    
    return { deleteItem, loadingDelete, error };
};
