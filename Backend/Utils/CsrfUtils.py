import hmac
import hashlib
import secrets
import time
import os
from typing import Optional

class CsrfUtils:
    @staticmethod
    def get_csrf_secret() -> str:
        """Get the CSRF secret key from environment variables"""
        secret = os.getenv("CSRF_SECRET_KEY")
        if not secret:
            raise ValueError("CSRF_SECRET_KEY environment variable is required")
        return secret
    
    @staticmethod
    def generate_csrf_token(session_id: Optional[str] = None) -> str:
        """
        Generate a CSRF token using HMAC
        
        Args:
            session_id: Optional session identifier to bind token to session
            
        Returns:
            Base64 encoded CSRF token
        """
        # Generate random data
        random_data = secrets.token_bytes(32)
        timestamp = str(int(time.time()))
        
        # Create payload: timestamp + session_id (if provided) + random_data
        payload_parts = [timestamp]
        if session_id:
            payload_parts.append(session_id)
        payload_parts.append(random_data.hex())
        
        payload = "|".join(payload_parts)
        
        # Create HMAC signature
        secret = CsrfUtils.get_csrf_secret()
        signature = hmac.new(
            secret.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Combine payload and signature
        token = f"{payload}|{signature}"
        
        # Base64 encode for safe transport
        import base64
        return base64.b64encode(token.encode()).decode()
    
    @staticmethod
    def validate_csrf_token(token: str, session_id: Optional[str] = None, max_age: int = 3600) -> bool:
        """
        Validate a CSRF token
        
        Args:
            token: Base64 encoded CSRF token
            session_id: Optional session identifier to validate against
            max_age: Maximum age of token in seconds (default 1 hour)
            
        Returns:
            True if token is valid, False otherwise
        """
        try:
            # Decode base64
            import base64
            decoded_token = base64.b64decode(token.encode()).decode()
            
            # Split token into parts
            parts = decoded_token.split("|")
            if len(parts) < 3:  # timestamp, random_data, signature (minimum)
                return False
            
            signature = parts[-1]
            payload_parts = parts[:-1]
            
            # Reconstruct payload
            payload = "|".join(payload_parts)
            
            # Verify signature
            secret = CsrfUtils.get_csrf_secret()
            expected_signature = hmac.new(
                secret.encode(),
                payload.encode(),
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(signature, expected_signature):
                return False
            
            # Check timestamp
            timestamp = int(payload_parts[0])
            current_time = int(time.time())
            
            if current_time - timestamp > max_age:
                return False
            
            # If session_id provided, validate it matches
            if session_id is not None:
                if len(payload_parts) < 3:  # timestamp, session_id, random_data
                    return False
                token_session_id = payload_parts[1]
                if not hmac.compare_digest(token_session_id, session_id):
                    return False
            
            return True
            
        except Exception:
            return False
        
    @staticmethod
    def generate_csrf_token_pair(session_id: Optional[str] = None) -> tuple[str, str]:
        """
        Generate a pair of CSRF tokens for double cookie submit
        
        Args:
            session_id: Optional session identifier to bind token to session
            
        Returns:
            Tuple of (secure_token, public_token) where public_token is derived from secure_token
        """
        # Generate the main secure token
        secure_token = CsrfUtils.generate_csrf_token(session_id)
        
        # Generate a public token that's HMAC of the secure token
        secret = CsrfUtils.get_csrf_secret()
        public_token = hmac.new(
            secret.encode(),
            secure_token.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return secure_token, public_token
    
    @staticmethod
    def validate_csrf_token_pair(secure_token: str, public_token: str, session_id: Optional[str] = None) -> bool:
        """
        Validate a CSRF token pair
        
        Args:
            secure_token: The HttpOnly cookie token
            public_token: The client-accessible token (from header or JS cookie)
            session_id: Optional session identifier to validate against
            
        Returns:
            True if both tokens are valid and linked, False otherwise
        """
        try:
            # First validate the secure token structure and expiry
            if not CsrfUtils.validate_csrf_token(secure_token, session_id):
                return False
            
            # Then validate that public token matches secure token
            secret = CsrfUtils.get_csrf_secret()
            expected_public = hmac.new(
                secret.encode(),
                secure_token.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(public_token, expected_public)
            
        except Exception:
            return False
