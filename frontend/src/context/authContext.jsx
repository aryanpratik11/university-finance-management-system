import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
  });

  const login = (user, token) => {
    setAuthState({ user, token });
    localStorage.setItem("authUser", JSON.stringify(user));
    localStorage.setItem("authToken", token);
  };

  const logout = () => {
    setAuthState({ user: null, token: null });
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
  };

  // Load persisted state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    const savedToken = localStorage.getItem("authToken");
    if (savedUser && savedToken) {
      setAuthState({
        user: JSON.parse(savedUser),
        token: savedToken,
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
