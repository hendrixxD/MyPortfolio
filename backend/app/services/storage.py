"""
Storage service for handling file uploads to Cloudflare R2.
"""
import io
import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException, status
from typing import BinaryIO

from app.core.config import settings


class StorageService:
    """Handle file storage operations with Cloudflare R2."""

    def __init__(self):
        """Initialize S3-compatible client for Cloudflare R2."""
        # Check if R2 is configured
        self.is_configured = all([
            settings.R2_ACCOUNT_ID,
            settings.R2_ACCESS_KEY_ID,
            settings.R2_SECRET_ACCESS_KEY,
            settings.R2_BUCKET_NAME
        ])

        if not self.is_configured:
            # Don't raise error - allow app to start
            # Upload endpoints will fail gracefully
            return

        self.s3_client = boto3.client(
            's3',
            endpoint_url=f'https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            region_name='auto'
        )
        self.bucket_name = settings.R2_BUCKET_NAME
        self.public_url = settings.R2_PUBLIC_URL

    def upload_file(
        self,
        file_data: bytes,
        filename: str,
        content_type: str = "application/octet-stream"
    ) -> str:
        """
        Upload a file to R2.

        Args:
            file_data: Binary file content
            filename: Name to save the file as
            content_type: MIME type of the file

        Returns:
            Public URL of the uploaded file
        """
        if not self.is_configured:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="R2 storage not configured. Please add R2 credentials to .env file."
            )

        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=filename,
                Body=file_data,
                ContentType=content_type
            )

            # Return the public URL
            return f"{self.public_url}/{filename}"

        except ClientError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file: {str(e)}"
            )

    def delete_file(self, filename: str) -> bool:
        """
        Delete a file from R2.

        Args:
            filename: Name of the file to delete

        Returns:
            True if successful
        """
        if not self.is_configured:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="R2 storage not configured. Please add R2 credentials to .env file."
            )

        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=filename
            )
            return True

        except ClientError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete file: {str(e)}"
            )

    def file_exists(self, filename: str) -> bool:
        """
        Check if a file exists in R2.

        Args:
            filename: Name of the file to check

        Returns:
            True if file exists
        """
        if not self.is_configured:
            return False

        try:
            self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=filename
            )
            return True
        except ClientError:
            return False

    def list_files(self, prefix: str = "") -> list[dict]:
        """
        List files in R2.

        Args:
            prefix: Optional prefix to filter files

        Returns:
            List of file metadata dictionaries
        """
        if not self.is_configured:
            return []

        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )

            files = []
            for obj in response.get('Contents', []):
                files.append({
                    'filename': obj['Key'],
                    'size': obj['Size'],
                    'last_modified': obj['LastModified'].isoformat(),
                    'url': f"{self.public_url}/{obj['Key']}"
                })

            return files

        except ClientError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to list files: {str(e)}"
            )


# Singleton instance
_storage_service = None


def get_storage_service() -> StorageService:
    """Get or create the storage service singleton."""
    global _storage_service
    if _storage_service is None:
        _storage_service = StorageService()
    return _storage_service
