# firebase_storage.py  (put this beside app.py or in a utils/ folder)
import os
import firebase_admin
from firebase_admin import credentials, storage

BUCKET_NAME = "connectit-63f60.firebasestorage.app"
SERVICE_KEY = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "firebase_key.json")

if not firebase_admin._apps:  # initialise once
    cred = credentials.Certificate(SERVICE_KEY)
    firebase_admin.initialize_app(cred, {"storageBucket": BUCKET_NAME})

bucket = storage.bucket()  # ready to use


# ##TODO: REMOVE THIS FOR PROD, ONLY FOR TESTING PURPOSES
# ----------------------------------------------------------------------
def list_company_documents() -> list[str]:
    """
    Returns a list of object names (paths) under companyDocument/
    """
    blobs = bucket.list_blobs(prefix="companyDocument/")
    # Exclude the folder placeholder itself (empty path)
    return [blob.name for blob in blobs if blob.name != "companyDocument/"]


files = list_company_documents()
print("Found:", len(files), "files")
for f in files:
    print(" •", f)
# #######Should see output like this:
# ----------------------------------------------------------------------
# Found: 1 files
#   • companyDocument/2412.17481v2.pdf
# ----------------------------------------------------------------------
####################################
