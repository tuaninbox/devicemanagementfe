import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  refreshUser: () => {},
  logout: () => {},
  login: () => {},
});

const defaultUser = {
  username: "admin",
  roles: ["admin"],
  forcePasswordChange: false,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(defaultUser);
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const refreshUser = async () => {
    setUser(defaultUser);
    setAuthLoading(false);
  };

  const logout = async () => {
    setUser(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    refreshUser(); // set default app user when auth is disabled
  }, []);

  const login = async (username, password) => {
    setAuthLoading(true);
    setError(null);

    const userObj = {
      username: username || defaultUser.username,
      roles: ["admin"],
      forcePasswordChange: false,
    };

    setUser(userObj);
    navigate("/");
    setAuthLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading, refreshUser, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}
