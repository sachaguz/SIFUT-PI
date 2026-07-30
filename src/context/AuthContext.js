import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import storage from '../services/storage';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      const token = await storage.getItemAsync('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await api.get('/auth/profile');
      if (Platform.OS === 'web' && data.role !== 'ADMIN') {
        await storage.deleteItemAsync('accessToken');
        await storage.deleteItemAsync('refreshToken');
        setLoading(false);
        return;
      }
      setUser(data);
    } catch {
      await storage.deleteItemAsync('accessToken');
      await storage.deleteItemAsync('refreshToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (Platform.OS === 'web' && data.user.role !== 'ADMIN') {
      throw { response: { data: { error: 'Acceso solo para administradores.' } } };
    }
    await storage.setItemAsync('accessToken', data.accessToken);
    await storage.setItemAsync('refreshToken', data.refreshToken);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ nombre, apellido, email, password }) => {
    await api.post('/auth/register', { nombre, apellido, email, password });
  }, []);

  const logout = useCallback(async () => {
    await storage.deleteItemAsync('accessToken');
    await storage.deleteItemAsync('refreshToken');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
