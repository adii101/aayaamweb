import { useState, useEffect } from "react";
import type { User, Team } from "@shared/schema";

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

// Custom hook to manage Teams state in localStorage
export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeams = () => {
      try {
        const stored = localStorage.getItem("aayam_teams");
        if (stored) {
          setTeams(JSON.parse(stored));
        } else {
          setTeams([]);
        }
      } catch (e) {
        console.error("Failed to parse teams", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTeams();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "aayam_teams") {
        loadTeams();
      }
    };
    
    window.addEventListener("storage", handleStorage);
    window.addEventListener("local-storage", loadTeams);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("local-storage", loadTeams);
    };
  }, []);

  const saveTeam = (newTeam: Team) => {
    const updated = [...teams, newTeam];
    localStorage.setItem("aayam_teams", JSON.stringify(updated));
    setTeams(updated);
    window.dispatchEvent(new Event("local-storage"));
  };

  const updateTeam = (updatedTeam: Team) => {
    const updated = teams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
    localStorage.setItem("aayam_teams", JSON.stringify(updated));
    setTeams(updated);
    window.dispatchEvent(new Event("local-storage"));
  };

  return { teams, saveTeam, updateTeam, isLoading };
}
