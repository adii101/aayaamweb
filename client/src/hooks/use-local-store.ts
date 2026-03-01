import { useState, useEffect } from "react";
import type { User } from "@shared/schema";

// Custom hook to manage User state in localStorage
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("aayam_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse user from local storage", e);
    } finally {
      setIsLoading(false);
    }

    // Listen for cross-tab changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "aayam_user") {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const saveUser = (newUser: User) => {
    localStorage.setItem("aayam_user", JSON.stringify(newUser));
    setUser(newUser);
    // Trigger storage event for same-tab updates if needed, though state update is usually enough
    window.dispatchEvent(new Event("local-storage"));
  };

  const logout = () => {
    localStorage.removeItem("aayam_user");
    setUser(null);
  };

  return { user, saveUser, logout, isLoading };
}
