import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuestas para manejar la rotación del token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado reintentar todavía
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refresh_token');

      // Si no hay refresh token, no podemos hacer nada
      if (!refreshToken) {
        Cookies.remove('access_token');
        Cookies.remove('user_data');
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Pedir un nuevo access token usando el refresh token
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        if (res.data.accessToken) {
          // Guardar el nuevo access token
          Cookies.set('access_token', res.data.accessToken, { secure: true, sameSite: 'strict' });
          
          // Actualizar el header de la petición original y reintentarla
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si el refresh token expiró o es inválido, forzar cierre de sesión
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('user_data');
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

