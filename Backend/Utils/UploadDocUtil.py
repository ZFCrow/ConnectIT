from werkzeug.utils import secure_filename
from firebaseStorage import bucket, BUCKET_NAME

ALLOWED_ROOTS = {"companyDocument", "portfolio", "profilePic", "resume"}


def upload_to_path(file_obj, target_path, public=True):
    """
    Upload `file_obj` to any path the caller supplies, e.g.
    target_path = "portfolio/screenshots/shot1.png"

    - Rejects paths outside the 4 allowed roots.
    - Returns public URL (default) or gs:// URI.
    """
    # normalise path & keep it safe
    parts = [p for p in target_path.split("/") if p]  # remove empty /..
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


def rename_file(old_path: str, new_path: str, public=True) -> str:
    """
    Rename a file in Firebase Storage by copying it to a new location
    and deleting the original.

    - Returns the new public URL or gs:// URI.
    """
    # Secure both paths
    old_parts = [p for p in old_path.split("/") if p]
    new_parts = [p for p in new_path.split("/") if p]

    if old_parts[0] not in ALLOWED_ROOTS or new_parts[0] not in ALLOWED_ROOTS:
        raise ValueError(f"Root must be one of {ALLOWED_ROOTS}")

    old_parts[-1] = secure_filename(old_parts[-1])
    new_parts[-1] = secure_filename(new_parts[-1])

    old_blob_path = "/".join(old_parts)
    new_blob_path = "/".join(new_parts)

    old_blob = bucket.blob(old_blob_path)
    new_blob = bucket.copy_blob(old_blob, bucket, new_blob_path)

    # Delete the old blob after copying
    old_blob.delete()

    if public:
        new_blob.make_public()
        return new_blob.public_url
    return f"gs://{BUCKET_NAME}/{new_blob_path}"
