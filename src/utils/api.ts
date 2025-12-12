import axios from "axios";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface ValidationErrors {
  [key: string]: string[];
}

interface ErrorResponse {
  message?: string;
  errors?: ValidationErrors;
}

console.log("API BASE URL:", process.env.NEXT_PUBLIC_API_BASE_URL);

const showToast = (message: string, type: 'error' | 'success' = 'error') => {
  toast[type](message, {
    duration: 4000,
    style: {
      background: type === 'error' ? '#FEE2E2' : '#DCFCE7',
      color: type === 'error' ? '#991B1B' : '#166534',
      border: `1px solid ${type === 'error' ? '#FCA5A5' : '#86EFAC'}`,
      padding: '16px',
      borderRadius: '8px',
    },
    icon: type === 'error' ? '❌' : '✅',
  });
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    showToast("Failed to send request. Please try again.");
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Show success toast for successful POST, PUT, DELETE requests
    if (response.config.method !== 'get') {
      // const action = method === 'POST' ? 'created' : method === 'PUT' ? 'updated' : 'deleted';
      // showToast(`Successfully ${action}!`, 'success');
    }
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    // Handle validation errors (422)
    if (status === 422 && data?.errors) {
      Object.values(data.errors).forEach((messages) => {
        if (Array.isArray(messages)) {
          messages.forEach((message) => showToast(message));
        }
      });
      return Promise.reject(error);
    }

    // Handle authentication errors (401)
    if (status === 401) {
      // showToast(data?.message || "Authentication failed. Please login again.");
      // Optionally redirect to login page
      // window.location.href = "/login";
      return Promise.reject(error);
    }

    // Handle common error statuses
    if (status === 400 || status === 404 || status === 403 || status === 500) {
      // showToast(data?.message || "Request failed. Please try again.");
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      showToast("Network error. Please check your connection.");
      return Promise.reject(error);
    }

    // Handle any other errors
    // showToast(data?.message || "An unexpected error occurred.");
    return Promise.reject(error);
  }
);

export default api;
