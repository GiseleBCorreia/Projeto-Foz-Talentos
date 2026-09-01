import axios from "https://cdn.jsdelivr.net/npm/axios@1.7.9/+esm";

const api = axios.create({
  baseURL: "https://foz-talentos-api.onrender.com/"
});

export default api;
