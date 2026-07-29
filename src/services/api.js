import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// IP local de la laptop en la red del celular (cambia esto si cambias de red/hotspot)
const API_URL = 'http://172.20.10.2:3000/api';

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => originalRequest?.url?.includes(path));
    if (error.response?.status !== 401 || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      processQueue(null, data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function tipoLabel(tipo) {
  const map = { FUTBOL5: 'Fútbol 5', FUTBOL7: 'Fútbol 7', FUTBOL11: 'Fútbol 11' };
  return map[tipo] || tipo;
}

export function posicionLabel(pos) {
  const map = { PORTERO: 'Portero', DEFENSA: 'Defensa', MEDIOCAMPISTA: 'Mediocampista', DELANTERO: 'Delantero' };
  return map[pos] || pos;
}

export function estadoLabel(estado) {
  const map = {
    ACTIVO: 'Activo', FINALIZADO: 'Finalizado', PROXIMO: 'Próximo',
    PENDIENTE: 'Pendiente', EN_CURSO: 'En curso',
    CONFIRMADA: 'Confirmada', COMPLETADA: 'Completada', CANCELADA: 'Cancelada',
    APROBADO: 'Aprobado', RECHAZADO: 'Rechazado',
  };
  return map[estado] || estado;
}

export default api;
