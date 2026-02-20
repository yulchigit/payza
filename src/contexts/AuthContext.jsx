import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import apiClient, { setAuthToken } from "lib/apiClient";

const TOKEN_KEY = "payza_access_token";
const AuthContext = createContext(null);

const normalizeAuthError = (error) => {
  const message = error?.response?.data?.error || error?.message || "Authentication failed";
  return typeof message === "string" ? message : "Authentication failed";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const persistSession = (nextToken) => {
    if (nextToken) {
      sessionStorage.setItem(TOKEN_KEY, nextToken);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  };

  const applySession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken);
    persistSession(nextToken);
  };

  const clearSession = () => {
    applySession(null, null);
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const storedToken = sessionStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        if (isMounted) setIsBootstrapping(false);
        return;
      }

      try {
        setAuthToken(storedToken);
        const response = await apiClient.get("/auth/me");
        const nextUser = response?.data?.data || null;

        if (!nextUser) {
          throw new Error("Failed to load user session");
        }

        if (isMounted) {
          applySession(storedToken, nextUser);
        }
      } catch (error) {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (payload) => {
    const response = await apiClient.post("/auth/login", payload);
    const nextToken = response?.data?.data?.token;
    const nextUser = response?.data?.data?.user;

    if (!nextToken || !nextUser) {
      throw new Error("Invalid login response");
    }

    applySession(nextToken, nextUser);
    return nextUser;
  };

  const register = async (payload) => {
    const response = await apiClient.post("/auth/register", payload);
    const nextToken = response?.data?.data?.token;
    const nextUser = response?.data?.data?.user;

    if (!nextToken || !nextUser) {
      throw new Error("Invalid registration response");
    }

    applySession(nextToken, nextUser);
    return nextUser;
  };

  const logout = () => {
    clearSession();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isBootstrapping,
      login,
      register,
      logout,
      normalizeAuthError
    }),
    [user, token, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
