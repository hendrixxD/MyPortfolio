#!/usr/bin/env python3
"""
Migration script to upload existing local files to Cloudflare R2.

Usage:
    python migrate_to_r2.py [--dry-run]

This script will:
1. Read all files from the local uploads directory
2. Upload them to R2 with the same filenames
3. Update database records to point to R2 URLs (if applicable)
"""
import os
import sys
import argparse
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings
from app.services.storage import get_storage_service
from app.database import SessionLocal
from app.models.gallery import GalleryItem


def get_content_type(filename: str) -> str:
    """Determine content type from filename."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    content_type_map = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
        "webp": "image/webp"
    }
    return content_type_map.get(ext, "image/jpeg")


def migrate_files(dry_run: bool = False):
    """Migrate files from local storage to R2."""
    upload_dir = settings.UPLOAD_DIR

    if not os.path.exists(upload_dir):
        print(f"Upload directory not found: {upload_dir}")
        return

    # Get all image files
    files = []
    for filename in os.listdir(upload_dir):
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext in settings.ALLOWED_EXTENSIONS:
            files.append(filename)

    if not files:
        print("No files found to migrate")
        return

    print(f"Found {len(files)} files to migrate")

    if dry_run:
        print("\n=== DRY RUN MODE ===")
        for filename in files:
            file_path = os.path.join(upload_dir, filename)
            size = os.path.getsize(file_path)
            print(f"Would upload: {filename} ({size} bytes)")
        print(f"\nTotal: {len(files)} files")
        return

    # Initialize storage service
    try:
        storage = get_storage_service()
    except ValueError as e:
        print(f"Error: {e}")
        print("\nMake sure R2 credentials are configured in .env file:")
        print("  R2_ACCOUNT_ID")
        print("  R2_ACCESS_KEY_ID")
        print("  R2_SECRET_ACCESS_KEY")
        print("  R2_BUCKET_NAME")
        return

    # Upload files
    successful = 0
    failed = 0

    for filename in files:
        file_path = os.path.join(upload_dir, filename)

        # Check if already exists in R2
        if storage.file_exists(filename):
            print(f"⏭️  Skipping (already exists): {filename}")
            successful += 1
            continue

        try:
            # Read file
            with open(file_path, "rb") as f:
                file_data = f.read()

            # Upload to R2
            content_type = get_content_type(filename)
            url = storage.upload_file(file_data, filename, content_type)

            print(f"✅ Uploaded: {filename} -> {url}")
            successful += 1

        except Exception as e:
            print(f"❌ Failed: {filename} - {str(e)}")
            failed += 1

    print(f"\n=== Migration Complete ===")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print(f"Total: {len(files)}")

    # Update database URLs
    print("\n=== Updating Database URLs ===")
    update_database_urls()


def update_database_urls():
    """Update gallery item URLs to point to R2."""
    db = SessionLocal()
    try:
        items = db.query(GalleryItem).all()

        if not items:
            print("No gallery items found in database")
            return

        updated = 0
        for item in items:
            # Check if URL needs updating (local path)
            if item.url.startswith("/uploads/"):
                old_url = item.url
                # Update to R2 URL
                item.url = f"{settings.R2_PUBLIC_URL}/{item.filename}"
                updated += 1
                print(f"Updated: {item.filename}")
                print(f"  Old: {old_url}")
                print(f"  New: {item.url}")

        if updated > 0:
            db.commit()
            print(f"\n✅ Updated {updated} database records")
        else:
            print("No database records needed updating")

    except Exception as e:
        print(f"Error updating database: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Migrate local uploads to Cloudflare R2")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be migrated without actually uploading"
    )

    args = parser.parse_args()

    print("=== Cloudflare R2 Migration Tool ===\n")
    migrate_files(dry_run=args.dry_run)


if __name__ == "__main__":
    main()
