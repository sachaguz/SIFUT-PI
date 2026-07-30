import axios from 'axios';
import { Platform } from 'react-native';
import storage from './storage';

// En web se sirve detrás del mismo nginx que el API, así que una ruta
// relativa basta. En nativo seguimos apuntando a la IP local de la laptop
// en la red del celular (cambia esto si cambias de red/hotspot).
const API_URL = Platform.OS === 'web' ? '/api' : 'http://172.20.10.2:3000/api';

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await storage.getItemAsync('accessToken');
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
      const refreshToken = await storage.getItemAsync('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      await storage.setItemAsync('accessToken', data.accessToken);
      processQueue(null, data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await storage.deleteItemAsync('accessToken');
      await storage.deleteItemAsync('refreshToken');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}

// Dates sent to the backend are nominal calendar days ("YYYY-MM-DD"),
// parsed there as UTC midnight. Building that string with toISOString()
// on a real Date (which carries the current time-of-day) converts through
// UTC first, so anyone west of UTC gets bumped to tomorrow once local
// time crosses into the next UTC day (e.g. after 6pm in UTC-6). Reading
// the local calendar fields directly avoids that shift entirely.
export function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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

const FASES_ELIMINATORIA = ['CUARTOS', 'SEMIFINAL', 'FINAL'];

export function esFaseEliminatoria(fase) {
  return FASES_ELIMINATORIA.includes(fase);
}

export function faseLabel(fase) {
  const map = { JORNADA: 'Jornada', CUARTOS: 'Cuartos de Final', SEMIFINAL: 'Semifinal', FINAL: 'Final' };
  return map[fase] || fase;
}

export default api;
