'use client';

import { useContext, createContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, logoutUser, getProfile } from '@/services/api/auth';

// Definición de tipos
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    // Verificación segura de window para Next.js
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }

        // Verificar si el token sigue siendo válido en el backend
        getProfile(storedToken)
          .then((profileData) => {
            setUser(profileData.user);
          })
          .catch(() => {
            // Token inválido, limpiar
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else {
        setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser({ email, password });

      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        return { success: true };
      }

      return { success: false, message: 'Error al iniciar sesión' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Error desconocido al iniciar sesión' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await registerUser({ name, email, password });

      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        return { success: true };
      }

      return { success: false, message: 'Error al registrar' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Error desconocido al registrar' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await logoutUser(token);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUser(null);
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  };

  // --- AQUÍ FALTABA EL RETURN ---
  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}