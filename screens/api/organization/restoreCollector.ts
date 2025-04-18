import { useEffect, useState } from "react";
import { ip_address } from "../ipAddress";
const base_api = `${ip_address}/api/user`;

export const useRestoreCollector= () => {
    const [loadingRestore, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const restoreCollector = async (id:number) => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${base_api}/user_recipient/restore/${id}`, {
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
    
    return { restoreCollector, loadingRestore, error };
};
