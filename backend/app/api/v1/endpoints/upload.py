"""
File upload endpoint.
"""
import os
import uuid
from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from PIL import Image

from app.api.deps import AdminUser
from app.core.config import settings

router = APIRouter(prefix="/upload", tags=["Upload"])


def validate_file_extension(filename: str) -> str:
    """Validate and return file extension."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    return ext


def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename."""
    ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else "jpg"
    unique_id = uuid.uuid4().hex[:8]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{timestamp}_{unique_id}.{ext}"


@router.post("/image")
async def upload_image(
    file: Annotated[UploadFile, File()],
    admin: AdminUser
):
    """
    Upload an image file.
    
    Returns the URL path to the uploaded file.
    Admin only.
    """
    # Validate file size
    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB"
        )
    
    # Validate extension
    if file.filename:
        validate_file_extension(file.filename)
    
    # Validate it's actually an image
    try:
        await file.seek(0)
        image_data = await file.read()
        img = Image.open(__import__("io").BytesIO(image_data))
        img.verify()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file"
        )
    
    # Generate unique filename
    filename = generate_unique_filename(file.filename or "image.jpg")
    
    # Create upload directory if it doesn't exist
    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(image_data)
    
    # Return the URL path
    return {
        "filename": filename,
        "url": f"/uploads/{filename}",
        "size": len(image_data)
    }


@router.delete("/image/{filename}")
def delete_image(filename: str, admin: AdminUser):
    """
    Delete an uploaded image.
    
    Admin only.
    """
    upload_dir = os.path.realpath(settings.UPLOAD_DIR)
    file_path = os.path.realpath(os.path.join(settings.UPLOAD_DIR, filename))

    if not file_path.startswith(upload_dir + os.sep):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    try:
        os.remove(file_path)
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}"
        )
