import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// Interceptor de Requisição: Anexa o JWT automaticamente nas chamadas autenticadas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("@photo-event:token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de Resposta: Trata HTTP 401 limpando a sessão e atualizando a interface
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("@photo-event:token");
      if (window.location.pathname.startsWith("/admin")) {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  },
);

// Função do fluxo público mantida 100% intacta
export const submitPhotos = async (formData, onProgress) => {
  const response = await api.post("/submissions", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

export default api;
