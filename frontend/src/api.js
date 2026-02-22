import axios from "axios";

const API = axios.create({
  baseURL: "/api", // nginx will proxy this to backend-service:5000
});

// Add token to requests if logged in
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
