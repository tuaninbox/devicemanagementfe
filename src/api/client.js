import axios from "axios";
import { API_BASE } from "../config";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,   // <-- REQUIRED for cookie-based auth
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optionally redirect to login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
        }
    }
    return Promise.reject(error);
  }
);
