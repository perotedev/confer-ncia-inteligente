import axios from "axios";

// Em desenvolvimento o Vite proxy repassa /api → localhost:3001
// Em produção o Nginx repassa /api → app instances
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { "Content-Type": "application/json" },
});

// Injeta o JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("checkflow_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Em caso de 401, limpa sessão e redireciona para login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("checkflow_token");
      localStorage.removeItem("checkflow_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    // Extrai a mensagem de erro da resposta do backend
    const message = error.response?.data?.message ?? error.message;
    return Promise.reject(new Error(message));
  },
);

export const SOCKET_URL = import.meta.env.VITE_API_URL ?? "";
