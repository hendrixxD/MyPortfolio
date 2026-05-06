"""
File content validation utilities using magic bytes.
"""
import io
from typing import BinaryIO, Dict, Set
from fastapi import HTTPException, status


# Magic bytes for common image formats
MAGIC_BYTES: Dict[str, Set[bytes]] = {
    "jpg": {
        b"\xff\xd8\xff\xe0",  # JPEG JFIF
        b"\xff\xd8\xff\xe1",  # JPEG Exif
        b"\xff\xd8\xff\xe2",  # JPEG Canon
        b"\xff\xd8\xff\xe3",  # JPEG Samsung
        b"\xff\xd8\xff\xe8",  # JPEG SPIFF
        b"\xff\xd8\xff\xdb",  # JPEG raw
        b"\xff\xd8\xff\xee",  # JPEG Adobe
    },
    "jpeg": {
        b"\xff\xd8\xff\xe0",
        b"\xff\xd8\xff\xe1",
        b"\xff\xd8\xff\xe2",
        b"\xff\xd8\xff\xe3",
        b"\xff\xd8\xff\xe8",
        b"\xff\xd8\xff\xdb",
        b"\xff\xd8\xff\xee",
    },
    "png": {b"\x89\x50\x4e\x47\x0d\x0a\x1a\x0a"},  # PNG signature
    "gif": {b"GIF87a", b"GIF89a"},  # GIF signatures
    "webp": {b"RIFF"},  # WebP (need to check WEBP after RIFF)
    "bmp": {b"BM"},  # BMP signature
    "ico": {b"\x00\x00\x01\x00"},  # ICO signature
    "svg": {b"<svg", b"<?xml"},  # SVG (XML-based)
}


def validate_file_content(file_data: bytes, expected_extension: str) -> bool:
    """
    Validate file content matches expected extension using magic bytes.

    Args:
        file_data: Raw file bytes
        expected_extension: Expected file extension (without dot)

    Returns:
        True if valid, raises HTTPException if invalid
    """
    if not file_data or len(file_data) < 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is too small or empty"
        )

    ext = expected_extension.lower().lstrip(".")

    # Get expected magic bytes for this extension
    expected_magics = MAGIC_BYTES.get(ext)
    if not expected_magics:
        # If we don't have magic bytes for this extension, allow it
        # (but log a warning in production)
        return True

    # Special handling for WebP
    if ext == "webp":
        if file_data[:4] == b"RIFF" and file_data[8:12] == b"WEBP":
            return True
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File content does not match extension .{ext} (WebP validation failed)"
        )

    # Special handling for SVG (XML-based)
    if ext == "svg":
        try:
            # Try to decode as UTF-8 and check for SVG markers
            content = file_data[:1000].decode("utf-8", errors="ignore").lower()
            if "<svg" in content or "<?xml" in content:
                return True
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File content does not match extension .{ext} (SVG validation failed)"
        )

    # Check magic bytes
    for magic in expected_magics:
        magic_len = len(magic)
        if file_data[:magic_len] == magic:
            return True

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"File content does not match extension .{ext}"
    )


def validate_image_content(file_data: bytes, filename: str) -> bool:
    """
    Validate image file content matches its extension.

    Args:
        file_data: Raw file bytes
        filename: Original filename with extension

    Returns:
        True if valid, raises HTTPException if invalid
    """
    if not filename or "." not in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename"
        )

    ext = filename.rsplit(".", 1)[-1].lower()
    return validate_file_content(file_data, ext)
