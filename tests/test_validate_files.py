import io
import pytest
from werkzeug.datastructures import FileStorage
from PIL import Image
from pypdf import PdfWriter
from Backend.Security.ValidateFiles import (
    enforce_image_limits,
    enforce_pdf_limits,
    Max_Image_Size,
    Max_PDF_Size,
    sanitize_pdf
)


def create_fake_pdf(content: bytes = b"%PDF-1.4\n1 0 obj", filename="doc.pdf"):
    return FileStorage(stream=io.BytesIO(content), filename=filename,
                       content_type='application/pdf')


def create_fake_image(format="PNG", size=(100, 100)) -> FileStorage:
    img_bytes = io.BytesIO()
    image = Image.new("RGB", size, color="white")
    image.save(img_bytes, format=format)
    img_bytes.seek(0)
    return FileStorage(
        stream=img_bytes,
        filename=f"test.{format.lower()}",
        content_type=f"image/{format.lower()}"
    )


# ------------------ PDF VALIDATION TESTS ------------------

def test_valid_pdf_passes():
    pdf = create_fake_pdf()
    enforce_pdf_limits(pdf)  # Should not raise


def test_pdf_too_large_raises():
    big_content = b"%PDF" + b"0" * (Max_PDF_Size + 1)
    pdf = create_fake_pdf(content=big_content)
    with pytest.raises(ValueError, match="too large"):
        enforce_pdf_limits(pdf)


def test_pdf_wrong_header():
    bad_pdf = create_fake_pdf(content=b"NOTPDF")
    with pytest.raises(ValueError, match="valid PDF"):
        enforce_pdf_limits(bad_pdf)


def test_pdf_double_extension_rejected():
    pdf = create_fake_pdf(filename="resume.v1.pdf")
    with pytest.raises(ValueError, match="multiple dots"):
        enforce_pdf_limits(pdf)


def test_sanitize_pdf_returns_filestorage():
    # Create a simple valid PDF in memory
    writer = PdfWriter()
    writer.add_blank_page(width=72, height=72)

    fake_pdf = io.BytesIO()
    writer.write(fake_pdf)
    fake_pdf.seek(0)

    file = FileStorage(
        stream=fake_pdf,
        filename="test.pdf",
        content_type="application/pdf"
    )

    result = sanitize_pdf(file)

    assert isinstance(result, FileStorage)
    assert result.filename == "test.pdf"
    assert result.content_type == "application/pdf"


# ------------------ IMAGE VALIDATION TESTS ------------------

def test_valid_png_image_passes():
    image = create_fake_image("PNG")
    enforce_image_limits(image)  # Should not raise


def test_valid_jpeg_image_passes():
    image = create_fake_image("JPEG")
    enforce_image_limits(image)  # Should not raise


def test_image_too_large_raises():
    huge_img = io.BytesIO(b"\xff\xd8" + b"\x00" * (Max_Image_Size + 1))
    image = FileStorage(stream=huge_img, filename="big.jpg", content_type="image/jpeg")
    with pytest.raises(ValueError, match="exceeds"):
        enforce_image_limits(image)


def test_image_disallowed_format():
    # Create a real GIF image in memory
    img_bytes = io.BytesIO()
    img = Image.new("RGB", (10, 10), color="red")
    img.save(img_bytes, format="GIF")
    img_bytes.seek(0)

    file = FileStorage(
        stream=img_bytes,
        filename="bad.gif",
        content_type="image/gif"
    )

    with pytest.raises(ValueError, match="Only JPEG/PNG"):
        enforce_image_limits(file)


def test_invalid_image_rejected():
    fake = FileStorage(stream=io.BytesIO(b"not an image"),
                       filename="bad.png", content_type="image/png")
    with pytest.raises(ValueError, match="Invalid image"):
        enforce_image_limits(fake)
