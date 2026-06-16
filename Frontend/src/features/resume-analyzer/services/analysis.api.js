import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

export async function analyzeResume(payload) {
  const response = await api.post("/api/analysis/analyze", payload);
  return response.data;
}
