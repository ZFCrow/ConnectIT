import io, os, tempfile
from PyPDF2 import PdfReader, PdfWriter
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

AllowedExtensions = [".pdf"]
Max_PDF_Size = 5 * 1024 * 1024  # 5 MB

def enforce_pdf_limits(file: FileStorage) -> None:
    filename = secure_filename(file.filename or "")
    if not filename.lower().endswith('.pdf'):
        raise ValueError("File must have a .pdf extension.")
    
    name_without_final_ext = filename[:-4] # check for double extensions like .png.pdf
    if '.' in name_without_final_ext:
        raise ValueError("File name must not contain multiple dots or extensions.") # 'image.png.pdf', name_without_final_ext is 'image.png'. and rejects it

    if file.content_length is None:
        file.seek(0, os.SEEK_END)
        if file.tell() > Max_PDF_Size:
            raise ValueError(f"File size exceeds {Max_PDF_Size / 1024 / 1024} MB limit.")
        file.seek(0)
    elif file.content_length > Max_PDF_Size:
        raise ValueError(f"File size exceeds {Max_PDF_Size / 1024 / 1024} MB limit.")

    header = file.read(4)
    file.seek(0)
    if header != b'%PDF':
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
        content_type='application/pdf'
    )