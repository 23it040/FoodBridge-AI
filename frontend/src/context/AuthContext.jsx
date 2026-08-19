import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import authService from '../services/auth.service';

const STORAGE_TOKEN = 'foodbridge_token';
const STORAGE_USER = 'foodbridge_user';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_USER);

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user', error);
      }
    }

    setLoading(false);
  }, []);

  const persistAuth = useCallback((authToken, authUser) => {
    localStorage.setItem(STORAGE_TOKEN, authToken);
    localStorage.setItem(STORAGE_USER, JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);
    persistAuth(result.token, result.user);
    return result.user;
  }, [persistAuth]);

  const register = useCallback(async (payload) => {
    const result = await authService.register(payload);
    persistAuth(result.token, result.user);
    return result.user;
  }, [persistAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
