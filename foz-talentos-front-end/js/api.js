import axios from "https://cdn.jsdelivr.net/npm/axios@1.7.9/+esm";

const api = axios.create({
  baseURL: "https://foz-talentos-api-production.up.railway.app"
});

export default api;
