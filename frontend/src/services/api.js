// import axios from 'axios';
// import { useAuthStore } from '../store';

// const api = axios.create({
//   baseURL: '/api',
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' }
// });

// // Request interceptor — ajouter le token
// api.interceptors.request.use(config => {
//   const token = useAuthStore.getState().accessToken;
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // Response interceptor — refresh auto
// api.interceptors.response.use(
//   res => res,
//   async err => {
//     const original = err.config;
//     if (err.response?.status === 401 && !original._retry) {
//       original._retry = true;
//       try {
//         const refreshToken = useAuthStore.getState().refreshToken;
//         const { data } = await axios.post('/api/auth/refresh', { refreshToken });
//         useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
//         original.headers.Authorization = `Bearer ${data.accessToken}`;
//         return api(original);
//       } catch (_) {
//         useAuthStore.getState().logout();
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(err);
//   }
// );

// // export default api;
// import axios from 'axios';
// import { useAuthStore } from '../store';

// const API_URL = import.meta.env.VITE_API_URL || '/api';

// const api = axios.create({
//   baseURL: API_URL,
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' }
// });

// // Request interceptor — ajouter le token
// api.interceptors.request.use(config => {
//   const token = useAuthStore.getState().accessToken;
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Response interceptor — refresh auto
// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach(prom => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// api.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;
    
//     // Évite les boucles infinies
//     if (originalRequest.url?.includes('/auth/refresh')) {
//       return Promise.reject(error);
//     }
    
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         // Met en file d'attente les requêtes pendant le refresh
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then(token => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             return api(originalRequest);
//           })
//           .catch(err => Promise.reject(err));
//       }
      
//       originalRequest._retry = true;
//       isRefreshing = true;
      
//       try {
//         const refreshToken = useAuthStore.getState().refreshToken;
//         if (!refreshToken) {
//           throw new Error('No refresh token');
//         }
        
//         // Créer une instance séparée pour le refresh (sans interceptor)
//         const refreshApi = axios.create({
//           baseURL: API_URL,
//           headers: { 'Content-Type': 'application/json' }
//         });
//         const { data } = await refreshApi.post('/auth/refresh', { refreshToken });
//         const { accessToken, refreshToken: newRefreshToken } = data.data || data;
        
//         useAuthStore.getState().setTokens(accessToken, newRefreshToken);
        
//         // Rejoue les requêtes en attente
//         processQueue(null, accessToken);
        
//         // Réessaie la requête originale
//         originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         processQueue(refreshError, null);
//         useAuthStore.getState().logout();
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default api;


import axios from 'axios';
import { useAuthStore } from '../store';

// Utilise la variable d'environnement Vite, ou '/api' par défaut (proxy local)
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor — ajouter le token
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — refresh auto
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Évite les boucles infinies sur la route de refresh
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Met en file d'attente les requêtes pendant le refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Instance séparée pour éviter les intercepteurs et utiliser la même baseURL
        const refreshApi = axios.create({
          baseURL: API_URL,
          headers: { 'Content-Type': 'application/json' }
        });
        const { data } = await refreshApi.post('/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data || data;

        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        // Rejoue les requêtes en attente
        processQueue(null, accessToken);

        // Réessaie la requête originale
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;