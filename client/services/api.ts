import axios from "axios";

const USE_LAN = false;

const API_URL = USE_LAN ? "http://10.4.56.20:3000" : "http://localhost:3000";
const api = axios.create({
  baseURL: API_URL,
  timeout: 120_000,
});

export default api;
