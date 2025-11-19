import axios from 'axios';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

export const registerUser = async (data: any) => {
  try {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al registrar usuario');
  }
};

export const loginUser = async (data: any) => {
  try {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
  }
};

export const getProfile = async (token: string) => {
  try {
    const response = await api.get('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener perfil');
  }
};

export const logoutUser = async (token: string) => {
  try {
    const response = await api.post('/api/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al cerrar sesión');
  }
};
export default api;
