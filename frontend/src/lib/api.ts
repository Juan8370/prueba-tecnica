import axios from 'axios';

// Limpiamos la URL para evitar dobles slashes
const rawBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL.slice(0, -1) : rawBaseURL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor de respuestas para manejar la rotación del token
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.log(`[API Error] ${originalRequest.method?.toUpperCase()} ${originalRequest.url} - ${error.response?.status}`);

    // Si el error es 401 y no hemos intentado reintentar todavía
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('[API] Attempting token refresh...');

      try {
        // Pedir un nuevo access token usando el refresh token
        // Usamos una ruta relativa para que axios use la baseURL correctamente sin dobles slashes
        await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        console.log('[API] Refresh successful, retrying original request...');
        
        // Reintentar la petición original
        return api(originalRequest);
      } catch (refreshError: any) {
        console.log(`[API] Refresh failed: ${refreshError.response?.status}`);
        // Si el refresh token expiró o es inválido, forzar cierre de sesión
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          console.log('[API] Redirecting to /login from', window.location.pathname);
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
