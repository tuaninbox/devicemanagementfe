import { createContext, useState, useEffect } from "react";
import { getMe, logout as apiLogout } from "../api/auth";

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  refreshUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    refreshUser(); // check session on page load
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
