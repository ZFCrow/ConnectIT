import React, { useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface HCaptchaProps {
  sitekey: string;
  onTokenChange?: (token: string | null) => void;
}

export const HCaptchaForm: React.FC<HCaptchaProps> = ({ sitekey, onTokenChange }) => {
  const [token, setToken] = useState<string | null>(null);

  return (
    <div>
      <HCaptcha
        sitekey={sitekey}
        onVerify={(token) => {
          setToken(token);
          if (onTokenChange) {
            onTokenChange(token);
          }
        }}
        onExpire={() => {
          setToken(null);
          if (onTokenChange) {
            onTokenChange(null);
          }
        }}
      />
    </div>
  );
};