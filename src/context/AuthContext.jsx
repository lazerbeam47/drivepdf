import { useCallback, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("drivepdf_token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("drivepdf_user");
    return raw ? JSON.parse(raw) : null;
  });

  const persistSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem("drivepdf_token", nextToken);
    localStorage.setItem("drivepdf_user", JSON.stringify(nextUser));
  }, []);

  const register = useCallback(
    async (payload) => {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: payload,
      });
      persistSession(data.token, data.user);
      return data.user;
    },
    [persistSession],
  );

  const login = useCallback(
    async (payload) => {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: payload,
      });
      persistSession(data.token, data.user);
      return data.user;
    },
    [persistSession],
  );

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
    localStorage.setItem("drivepdf_user", JSON.stringify(nextUser));
  }, []);

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
    localStorage.removeItem("drivepdf_token");
    localStorage.removeItem("drivepdf_user");
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isPremium: user?.plan === "premium",
      register,
      login,
      logout,
      updateUser,
    }),
    [login, logout, register, token, updateUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
