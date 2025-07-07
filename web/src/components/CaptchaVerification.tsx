import { useState } from "react";
import axios, {
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  isAxiosError,
} from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
    const csrf = match ? match[1] : "";

    const headers = new AxiosHeaders(config.headers || {});
    headers.set("X-CSRFToken", csrf);
    config.headers = headers;

    return config;
  },
  (err) => Promise.reject(err)
);

export const useCaptchaVerification = () => {
  const [captchaVerificationStatus, setCaptchaVerificationStatus] =
    useState<string | null>(null);

  const verifyCaptchaToken = async (token: string | null) => {
    setCaptchaVerificationStatus(null);

    if (!token) {
      console.warn("CAPTCHA token expired or not available.");
      setCaptchaVerificationStatus("CAPTCHA Not Completed");
      return;
    }

    try {
      const response = await api.post("/verify-captcha", { token });

      if (response.data.success) {
        setCaptchaVerificationStatus("Verified");
      } else {
        console.error("CAPTCHA Verification FAILED:", response.data.message);
        setCaptchaVerificationStatus(
          `Verification Failed: ${response.data.message}`
        );
      }
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        const msg = error.response.data?.message || error.message;
        console.error("Error during CAPTCHA verification:", msg);
        setCaptchaVerificationStatus(`Verification Failed: ${msg}`);
      } else {
        console.error("Network error during CAPTCHA verification:", error);
        setCaptchaVerificationStatus("Verification Failed: Network Error");
      }
    }
  };

  const resetCaptchaStatus = () => {
    setCaptchaVerificationStatus(null);
  };

  return { captchaVerificationStatus, verifyCaptchaToken, resetCaptchaStatus };
};