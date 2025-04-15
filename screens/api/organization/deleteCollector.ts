import { useEffect, useState } from "react";
import { ip_address } from "../ipAddress";
const base_api = `${ip_address}/api/user`;
// const base_api = "http://192.168.0.183:8080/api/user";

export const useDeleteCollector= () => {
    const [loadingDelete, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteCollector = async (id:number) => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${base_api}/user_recipient/delete/${id}`, {
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
    
    return { deleteCollector, loadingDelete, error };
};
