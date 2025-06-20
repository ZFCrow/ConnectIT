from werkzeug.utils import secure_filename
from app import bucket, BUCKET_NAME
ALLOWED_ROOTS = {"companyDocument", "portfolio", "profilePic", "resume"}  # safety

def upload_to_path(file_obj, target_path, public=True):
    """
    Upload `file_obj` to any path the caller supplies, e.g.
    target_path = "portfolio/screenshots/shot1.png"

    - Rejects paths outside the 4 allowed roots.
    - Returns public URL (default) or gs:// URI.
    """
    # normalise path & keep it safe
    parts = [p for p in target_path.split("/") if p]      # remove empty /..
    if parts[0] not in ALLOWED_ROOTS:
        raise ValueError(f"Root must be one of {ALLOWED_ROOTS}")

    # always secure the final component (filename)
    parts[-1] = secure_filename(parts[-1])
    blob_path = "/".join(parts)

    blob = bucket.blob(blob_path)
    file_obj.seek(0)
    blob.upload_from_file(file_obj, content_type=file_obj.content_type)

    if public:
        blob.make_public()
        return blob.public_url
    return f"gs://{BUCKET_NAME}/{blob_path}"