import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the JWT to every request automatically, if we have one stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tp_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever says our token is invalid/expired, log the user out
// client-side so the UI doesn't sit in a broken half-authenticated state.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("tp_token");
      localStorage.removeItem("tp_user");
    }
    return Promise.reject(err);
  }
);

export default api;
