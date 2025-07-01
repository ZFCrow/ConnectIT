# import io
import os
import tempfile
import uuid
from pypdf import PdfReader, PdfWriter
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
from PIL import Image

AllowedExtensions = [".pdf"]
Max_PDF_Size = 1 * 1024 * 1024  # 1 MB
AllowedImageFormats = {"JPEG", "PNG"}
Max_Image_Size = 1 * 1024 * 1024  # 1 MB


def enforce_pdf_limits(file: FileStorage) -> None:
    filename = secure_filename(file.filename or "")
    if not filename.lower().endswith(".pdf"):
        raise ValueError("File must have a .pdf extension.")
    name_without_final_ext = filename[:-4]
    # check for double extensions like .png.pdf
    if "." in name_without_final_ext:
        # 'image.png.pdf', \
        # name_without_final_ext is 'image.png'. and rejects it
        raise ValueError("File name must not contain multiple dots or extensions.")

    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > Max_PDF_Size:
        raise ValueError(f"PDF is too large (max {Max_PDF_Size//1024//1024} MB)")

    header = file.read(4)
    file.seek(0)
    if header != b"%PDF":
        raise ValueError("File is not a valid PDF")


def sanitize_pdf(file: FileStorage) -> FileStorage:
    reader = PdfReader(file)
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)

    spooled_temp_file = tempfile.SpooledTemporaryFile(max_size=Max_PDF_Size)
    writer.write(spooled_temp_file)
    spooled_temp_file.seek(0)

    return FileStorage(
        stream=spooled_temp_file,
        filename=secure_filename(file.filename),
        content_type="application/pdf",
    )


def enforce_image_limits(file: FileStorage) -> None:
    file.seek(0, os.SEEK_END)
    if file.tell() > Max_Image_Size:
        raise ValueError(f"Image size exceeds {Max_Image_Size / 1024 / 1024} MB limit.")
    file.seek(0)

    try:
        img = Image.open(file)
        img.verify()  # Verify that it is a valid image
    except Exception:
        file.seek(0)
        raise ValueError("Invalid image file")

    if img.format not in AllowedImageFormats:
        raise ValueError(f"Only JPEG/PNG images allowed (detected {img.format})")
    file.seek(0)


def sanitize_image(file: FileStorage) -> FileStorage:
    # Convert to RGB to ensure compatibility
    img = Image.open(file).convert("RGB")
    spooled_temp_file = tempfile.SpooledTemporaryFile(max_size=Max_Image_Size)
    img.save(spooled_temp_file, format="JPEG", quality=85)  # Save as JPEG with quality
    spooled_temp_file.seek(0)

    name = uuid.uuid4().hex + ".jpg"
    return FileStorage(
        stream=spooled_temp_file, filename=name, content_type="image/jpeg"
    )
