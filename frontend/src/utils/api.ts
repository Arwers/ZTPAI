import axios from 'axios';

// Helper function to get cookie by name
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
};

// Create API instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true, // Always include cookies
});

// Add consistent authentication to all requests
api.interceptors.request.use(
  (config) => {
    // Make sure cookies are always sent
    config.withCredentials = true;
    
    // Get access token from cookie
    const accessToken = getCookie('access_token');
    
    // Add Authorization header if token exists
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
