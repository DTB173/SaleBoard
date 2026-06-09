import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000, // Optional: prevents hanging requests
});

// Token getter from Clerk
let getTokenReference = null;

export const injectStore = (getter) => {
  getTokenReference = getter;
};

// Request Interceptor - Automatically attach Clerk JWT
api.interceptors.request.use(
  async (config) => {
    const isPublic =
      config.method === "get" &&
      (
        config.url === "/products" ||
        config.url?.startsWith("/products?") ||
        config.url === "/categories" ||
        config.url?.startsWith("/categories?")
      );

    if (!isPublic && getTokenReference) {
      const token = await getTokenReference();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Optional but very useful)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized - Token might be expired");
      // You could trigger sign out here if needed
    }
    return Promise.reject(error);
  }
);

export default api;