from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os
import base64
from io import BytesIO


def encrypt_file_gcm(file_obj) -> BytesIO:
    """
    Encrypts a file using AES-256-GCM.
    Returns BytesIO containing IV + ciphertext + tag.
    """
    file_obj.seek(0)
    data = file_obj.read()

    try:
        raw_key = base64.b64decode(os.environ["AES_GCM_KEY"])
    except KeyError:
        raise RuntimeError("AES_GCM_KEY environment variable is not set")

    aesgcm = AESGCM(raw_key)
    iv = os.urandom(12)
    ciphertext = aesgcm.encrypt(iv, data, None)

    encrypted_data = iv + ciphertext
    enc_file = BytesIO(encrypted_data)
    enc_file.seek(0)
    enc_file.content_type = "application/octet-stream"
    return enc_file


def decrypt_file_gcm(enc_file_obj) -> BytesIO:
    """
    Decrypts a file previously encrypted with AES-256-GCM (IV + ciphertext+tag).
    Returns a BytesIO of the decrypted data.
    """
    enc_file_obj.seek(0)
    enc_data = enc_file_obj.read()

    if len(enc_data) < 13:
        raise ValueError(
            "Encrypted file is too short to contain valid IV and ciphertext"
        )

    try:
        raw_key = base64.b64decode(os.environ["AES_GCM_KEY"])
    except KeyError:
        raise RuntimeError("AES_GCM_KEY environment variable is not set")

    # Split IV and ciphertext+tag
    iv = enc_data[:12]
    ciphertext = enc_data[12:]

    aesgcm = AESGCM(raw_key)
    try:
        decrypted_data = aesgcm.decrypt(iv, ciphertext, None)
    except Exception as e:
        raise ValueError(f"Decryption failed: {e}")

    decrypted_file = BytesIO(decrypted_data)
    decrypted_file.seek(0)
    return decrypted_file
