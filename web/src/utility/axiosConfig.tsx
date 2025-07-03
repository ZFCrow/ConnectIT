import axios, { AxiosHeaders, type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
export type { AxiosResponse };

axios.defaults.withCredentials = true;

/**
 * Fetches a fresh CSRF token from the server and sets it on the default headers.
 * Call this once before making any POST/PUT/DELETE requests.
 */
export async function initCsrf() {
  try {
    const { data } = await axios.get<{ csrfToken: string }>("/api/csrf-token");
    axios.defaults.headers.common["X-CSRFToken"] = data.csrfToken;
  } catch (err) {
    console.error("Failed to initialize CSRF token:", err);
  }
}

// initialize CSRF token immediately
initCsrf();

// on every request, ensure the CSRF header is set
axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const headers = new AxiosHeaders(config.headers || {});
    // If we don't already have the CSRF header (e.g., token refreshed), try fallback from cookie
    if (!headers.has("X-CSRFToken")) {
      const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
      const csrf = match ? match[1] : "";
      if (csrf) {
        headers.set("X-CSRFToken", csrf);
      }
    }
    config.headers = headers;
    return config;
  },
  (err) => Promise.reject(err)
);

axios.interceptors.response.use(
  response => response,
  async (error) => {
    const status = error?.response?.status;
    const msg    = error?.response?.data?.error;

    // adjust to your exact message/code
    if (status === 401 && msg === "Session invalidated; please log in again") {
      // clear any app state here
      // e.g. store.dispatch(logoutAction());

      // redirect user to login
      window.location.href = "/login";
      return Promise.resolve();  // swallow the error if you like
    }

    return Promise.reject(error);
  }
);

export default axios;
