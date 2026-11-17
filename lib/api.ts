const getBaseUrl = () => {
  if (typeof window === "undefined") {
    return process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:3001";
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || "";
};

export const apiClient = {
  get baseUrl() {
    return getBaseUrl();
  },

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${getBaseUrl()}${endpoint}`;
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    const headers: HeadersInit = isFormData
      ? { ...(options.headers || {}) }
      : {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        };

    // Never let a slow or restarting backend hang page rendering
    const timeoutMs = typeof window === "undefined" ? 4000 : 12000;
    const signal =
      options.signal ||
      (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
        ? AbortSignal.timeout(timeoutMs)
        : undefined);

    return fetch(url, { ...options, headers, signal });
  },

  get: (endpoint: string, options?: RequestInit) =>
    apiClient.request(endpoint, { ...options, method: "GET" }),

  post: (endpoint: string, data?: any, options?: RequestInit) => {
    if (typeof FormData !== "undefined" && data instanceof FormData) {
      return apiClient.request(endpoint, {
        ...options,
        method: "POST",
        body: data,
      });
    }
    if (
      data &&
      typeof data === "object" &&
      typeof FormData !== "undefined" &&
      data.body instanceof FormData
    ) {
      return apiClient.request(endpoint, {
        ...options,
        ...data,
        method: "POST",
      });
    }
    return apiClient.request(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put: (endpoint: string, data?: any, options?: RequestInit) =>
    apiClient.request(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint: string, options?: RequestInit) =>
    apiClient.request(endpoint, { ...options, method: "DELETE" }),
};

export default apiClient;
