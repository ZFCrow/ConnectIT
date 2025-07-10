import axios, { AxiosHeaders, type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
export type { AxiosResponse };

axios.defaults.withCredentials = true;

// Track CSRF initialization state
let csrfInitialized = false;
let csrfInitPromise: Promise<void> | null = null;

/**
 * Fetches a fresh CSRF token from the server and sets it on the default headers.
 * Only call this after user is authenticated.
 */
export async function initCsrf(): Promise<void> {
  if (csrfInitialized) return;
  
  if (csrfInitPromise) {
    return csrfInitPromise;
  }
  
  csrfInitPromise = (async () => {
    try {
      const { data } = await axios.get<{ csrfToken: string }>("/api/csrf-token");
      axios.defaults.headers.common["X-CSRFToken"] = data.csrfToken;
      csrfInitialized = true;
    } catch (err) {
      console.error("Failed to initialize CSRF token:", err);
      csrfInitPromise = null; // Allow retry
      throw err;
    }
  })();
  
  return csrfInitPromise;
}

/**
 * Reset CSRF state - call this on logout
 */
export function resetCsrf(): void {
  csrfInitialized = false;
  csrfInitPromise = null;
  delete axios.defaults.headers.common["X-CSRFToken"];
}

// DON'T auto-initialize CSRF - only after login
// initCsrf().catch(console.error);

// Enhanced request interceptor
axios.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip CSRF for auth endpoints and CSRF token endpoint
    if (config.url?.includes("/csrf-token") || 
        config.url?.includes("/login") || 
        config.url?.includes("/register") ||
        config.url?.includes("/create_token")) {
      return config;
    }
    
    // For modifying requests, try to get CSRF from cookie if not initialized
    if (["get", "post", "put", "delete"].includes(config.method?.toLowerCase() || "")) {
      const headers = new AxiosHeaders(config.headers || {});
      
      // If we don't already have the CSRF header, try fallback from cookie
      if (!headers.has("X-CSRFToken")) {
        const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
        const csrf = match ? match[1] : "";
        if (csrf) {
          headers.set("X-CSRFToken", csrf);
        }
      }
      
      config.headers = headers;
    }
    
    return config;
  },
  (err) => Promise.reject(err)
);

axios.interceptors.response.use(
  response => response,
  async (error) => {
    const status = error?.response?.status;
    const msg    = error?.response?.data?.error;

    // If CSRF token fails, try to reinitialize (only if user is authenticated)
    if (status === 400 && (msg?.includes("CSRF") || msg?.includes("csrf"))) {
      console.warn("CSRF error, attempting to refresh token...");
      // Check if user has session token before trying to refresh CSRF
      const hasSession = document.cookie.includes("session_token=");
      if (hasSession) {
        resetCsrf();
        try {
          await initCsrf();
          // Retry the original request
          return axios.request(error.config);
        } catch (csrfErr) {
          console.error("CSRF refresh failed:", csrfErr);
        }
      } else {
        // No session - clear CSRF state
        resetCsrf();
      }
    }

    // Handle session invalidation
    if (status === 401 && (msg === "Session invalidated; please log in again" || msg === "Invalid or expired token")) {
      console.warn("Session invalidated, clearing state...");
      // Clear CSRF state on session invalidation
      resetCsrf();
      
      // redirect user to login
      window.location.href = "/login";
      return Promise.resolve();  // swallow the error if you like
    }

    return Promise.reject(error);
  }
);

export default axios;
