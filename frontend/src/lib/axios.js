// In your axiosInstance setup (axios.js)

import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api/v1" : "/api/v1",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt-linkedin");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // Ensure this is correctly added
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
