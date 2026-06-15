import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
	baseURL: BASE_URL,
	headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT on every request ──────────────────────────
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ─────────────────────────────────
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Token expired — clear storage and reload to /login
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			if (window.location.pathname !== "/login") {
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	}
);

// ── Auth endpoints ─────────────────────────────────────────────────────────────
export const authApi = {
	register: (data) => api.post("/auth/register", data),
	login: (data, isBiometric = false) => api.post(isBiometric ? "/auth/login-biometrics" : "/auth/login", data),
	logout: () => api.post("/auth/logout"),
	verifyToken: () => api.get("/auth/verify"),
	getProfile: () => api.get("/auth/profile"),
	verifyEmail: (token) => api.post(`/auth/verify-email/${token}`),
	forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
	resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
	upgradeKyc: (data) => api.post("/auth/upgrade-kyc", data),
	updateProfile: (data) => api.put("/auth/update-profile", data),
	updateSettings: (data) => api.put("/auth/update-settings", data),
	changePassword: (data) => api.put("/auth/change-password", data),
	setupBiometrics: (data) => api.post("/auth/setup-biometrics", data),
	toggleRoundUp: () => api.post("/auth/toggle-roundup"),
};

// ── Transaction endpoints ──────────────────────────────────────────────────────
export const transactionsApi = {
	getAll: (params) => api.get("/transactions", { params }),
	getSummary: () => api.get("/transactions/summary"),
	getById: (id) => api.get(`/transactions/${id}`),
	create: (data, headers = {}) => api.post("/transactions", data, { headers }),
	update: (id, data) => api.put(`/transactions/${id}`, data),
	delete: (id) => api.delete(`/transactions/${id}`),
};

// ── AI endpoints ───────────────────────────────────────────────────────────────
export const aiApi = {
	analyze: () => api.get("/ai/analyze"),
	getForecast: () => api.get("/ai/predict"),
	sendMessage: (message) => api.post("/ai/chat", { message }),
	getMonthlyReport: () => api.get("/ai/report"),
};



// ── Savings (Safelock) endpoints ────────────────────────────────────────────────
export const savingsApi = {
	getAll: () => api.get("/savings"),
	getVault: () => api.get("/savings/vault"),
	create: (data, headers = {}) => api.post("/savings", data, { headers }),
	investToVault: (amount) => api.post("/savings/vault/invest", { amount }),
	withdraw: (id) => api.post(`/savings/${id}/withdraw`),

};

// ── PIN endpoints ──────────────────────────────────────────────────────────────
export const pinApi = {
	set: (pin) => api.post("/pin/set", { pin }),
	verify: (pin) => api.post("/pin/verify", { pin }),
};

// ── Bill endpoints ─────────────────────────────────────────────────────────────
export const billsApi = {
	buyAirtime: (data) => api.post("/bills/airtime", data),
	buyData: (data) => api.post("/bills/data", data),
};

// ── Virtual Card endpoints ──────────────────────────────────────────────────────
export const cardApi = {
	getAll: () => api.get("/cards"),
	create: (data) => api.post("/cards", data),
	fund: (data) => api.post("/cards/fund", data),
};

// ── Budget endpoints ───────────────────────────────────────────────────────────
export const budgetApi = {
	getAll: () => api.get("/budgets"),
	set: (data) => api.post("/budgets", data),
};

export default api;
