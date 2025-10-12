// UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../Authentication/supabaseconfig";

interface User {
  firstName: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({ user: null, loading: true });

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        const currentUser = authData?.user;
        if (!currentUser) {
          if (!mounted) return;
          setUser({ firstName: "Guest", role: "Guest" });
          setLoading(false);
          return;
        }

        // Try fetching worker by ID
        const { data: workerData, error: workerError } = await supabase
          .from("workers")
          .select("first_name, role")

          .eq("worker_id", currentUser.id)

          .maybeSingle();

        if (workerError) console.warn(workerError.message);

        if (workerData) {
          if (!mounted) return;
          setUser({
            firstName: workerData.first_name || "User",
            role: workerData.role || "User",
          });
          setLoading(false);
          return;
        }

        // fallback: use email local-part
        const fallbackName = currentUser.email?.split("@")[0] || "User";
        if (!mounted) return;
        setUser({ firstName: fallbackName, role: "User" });
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching user info:", err);
        if (!mounted) return;
        setUser({ firstName: "Unknown", role: "User" });
        setLoading(false);
      }
    };

    fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  return <UserContext.Provider value={{ user, loading }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
