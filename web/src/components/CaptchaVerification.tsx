import { useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export const useCaptchaVerification = () => {
  const [captchaVerificationStatus, setCaptchaVerificationStatus] = useState<string | null>(null);

  const verifyCaptchaToken = async (token: string | null) => {
    setCaptchaVerificationStatus(null);

    if (!token) {
      console.log('CAPTCHA token expired or not available.');
      setCaptchaVerificationStatus('CAPTCHA Not Completed');
      return;
    }

    try {
      console.log('Sending CAPTCHA token to backend for verification...');
      const response = await api.post('/verify-captcha', { token: token });

      const data = response.data;

      if (data.success) {
        console.log('CAPTCHA Verification SUCCESS:', data.message);
        setCaptchaVerificationStatus('Verified');
      } else {
        console.error('CAPTCHA Verification FAILED:', data.message);
        setCaptchaVerificationStatus(`Verification Failed: ${data.message}`);
      }
    } catch (error) {

      if (axios.isAxiosError(error) && error.response) {
        console.error('Error during CAPTCHA verification request:', error.response.data.message || error.message);
        setCaptchaVerificationStatus(`Verification Failed: ${error.response.data.message || 'Server Error', token}`);
      } else {
        console.error('Error during CAPTCHA verification request:', error);
        setCaptchaVerificationStatus('Verification Failed: Network Error');
      }
    }
  };

  const resetCaptchaStatus = () => {
    setCaptchaVerificationStatus(null);
  };

  return { captchaVerificationStatus, verifyCaptchaToken, resetCaptchaStatus };
};