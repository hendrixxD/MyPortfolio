"""
MIME type mappings for file uploads.
"""

# Comprehensive MIME type mapping
MIME_TYPE_MAP = {
    # Images
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "webp": "image/webp",
    "svg": "image/svg+xml",
    "bmp": "image/bmp",
    "tiff": "image/tiff",
    "tif": "image/tiff",
    "ico": "image/x-icon",
    "heic": "image/heic",
    "heif": "image/heif",
    "avif": "image/avif",

    # Videos
    "mp4": "video/mp4",
    "webm": "video/webm",
    "mov": "video/quicktime",
    "avi": "video/x-msvideo",
    "mkv": "video/x-matroska",
    "flv": "video/x-flv",
    "wmv": "video/x-ms-wmv",
    "m4v": "video/x-m4v",
    "mpeg": "video/mpeg",
    "mpg": "video/mpeg",
}


def get_content_type(filename: str) -> str:
    """
    Get MIME type from filename extension.

    Args:
        filename: The filename to check

    Returns:
        MIME type string, defaults to application/octet-stream
    """
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return MIME_TYPE_MAP.get(ext, "application/octet-stream")


def is_video(filename: str) -> bool:
    """Check if file is a video based on extension."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return MIME_TYPE_MAP.get(ext, "").startswith("video/")


def is_image(filename: str) -> bool:
    """Check if file is an image based on extension."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return MIME_TYPE_MAP.get(ext, "").startswith("image/")
