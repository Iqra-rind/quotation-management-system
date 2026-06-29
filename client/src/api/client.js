import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT (if we have one) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token is invalid/expired, clear it and let the app fall back to the
// login page on the next render (AuthContext reacts to this custom event).
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(err);
  }
);

// ---- Auth ----
export const login = (data) => api.post("/auth/login", data).then((r) => r.data);
export const register = (data) => api.post("/auth/register", data).then((r) => r.data);
export const getMe = () => api.get("/auth/me").then((r) => r.data);

// ---- Vendors ----
export const getVendors = (params) => api.get("/vendors", { params }).then((r) => r.data);
export const getVendor = (id) => api.get(`/vendors/${id}`).then((r) => r.data);
export const createVendor = (data) => api.post("/vendors", data).then((r) => r.data);
export const updateVendor = (id, data) => api.put(`/vendors/${id}`, data).then((r) => r.data);
export const deleteVendor = (id) => api.delete(`/vendors/${id}`).then((r) => r.data);

// ---- Quotation Requests ----
export const getQuotationRequests = (params) => api.get("/quotation-requests", { params }).then((r) => r.data);
export const getQuotationRequest = (id) => api.get(`/quotation-requests/${id}`).then((r) => r.data);
export const createQuotationRequest = (data) => api.post("/quotation-requests", data).then((r) => r.data);
export const updateQuotationRequest = (id, data) => api.put(`/quotation-requests/${id}`, data).then((r) => r.data);
export const deleteQuotationRequest = (id) => api.delete(`/quotation-requests/${id}`).then((r) => r.data);

// ---- Quotations ----
export const getQuotations = (params) => api.get("/quotations", { params }).then((r) => r.data);
export const getQuotation = (id) => api.get(`/quotations/${id}`).then((r) => r.data);
export const submitQuotation = (id, data) => api.put(`/quotations/${id}/submit`, data).then((r) => r.data);
export const updateQuotationStatus = (id, status) =>
  api.put(`/quotations/${id}/status`, { status }).then((r) => r.data);
export const deleteQuotation = (id) => api.delete(`/quotations/${id}`).then((r) => r.data);
export const getQuotationPdfUrl = (id) => `/api/quotations/${id}/pdf`;

// ---- Dashboard ----
export const getDashboardStats = () => api.get("/dashboard").then((r) => r.data);

// ---- Error helper ----
export function getErrorMessage(err) {
  if (err.response?.data?.errors?.length) {
    return err.response.data.errors.map((e) => e.message).join(" ");
  }
  if (err.response?.data?.error) return err.response.data.error;
  return "Something went wrong. Please try again.";
}

export default api;
