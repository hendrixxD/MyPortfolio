#!/usr/bin/env python3
"""
Image Upload Load Test

Tests R2 integration under stress with concurrent uploads.
Monitors upload success rate, PIL processing time, and backend responsiveness.

Usage:
    python test_image_upload_load.py [API_URL] [ADMIN_TOKEN]

Example:
    python test_image_upload_load.py http://localhost:8000 your_jwt_token
"""
import os
import sys
import time
import asyncio
import aiohttp
import io
from PIL import Image
from datetime import datetime
from typing import List, Tuple
import statistics


class ImageUploadLoadTest:
    """Load test for concurrent image uploads."""

    def __init__(self, api_url: str, admin_token: str):
        self.api_url = api_url.rstrip('/')
        self.upload_endpoint = f"{self.api_url}/api/v1/upload/file"
        self.admin_token = admin_token

        # Test configuration
        self.concurrent_uploads = 10
        self.image_size_mb = 10
        self.timeout_seconds = 60

        # Metrics
        self.upload_times: List[float] = []
        self.pil_processing_times: List[float] = []
        self.success_count = 0
        self.failure_count = 0
        self.r2_errors = 0
        self.timeout_errors = 0

    def generate_test_image(self, size_mb: int) -> Tuple[bytes, float]:
        """
        Generate a test image of specified size.

        Returns:
            Tuple of (image_bytes, pil_processing_time)
        """
        # Calculate dimensions to achieve target file size
        # Rough estimation: 1MB ≈ 500x500 PNG with some compression
        dimension = int((size_mb * 500000) ** 0.5)

        pil_start = time.time()

        # Create a colorful gradient image
        img = Image.new('RGB', (dimension, dimension))
        pixels = img.load()

        for i in range(dimension):
            for j in range(dimension):
                pixels[i, j] = (
                    (i * 255) // dimension,
                    (j * 255) // dimension,
                    ((i + j) * 255) // (dimension * 2)
                )

        # Save to bytes
        buffer = io.BytesIO()
        img.save(buffer, format='PNG', optimize=False)
        image_bytes = buffer.getvalue()

        pil_processing_time = time.time() - pil_start

        return image_bytes, pil_processing_time

    async def upload_image(
        self,
        session: aiohttp.ClientSession,
        image_data: bytes,
        file_number: int
    ) -> bool:
        """
        Upload a single image asynchronously.

        Returns:
            True if successful, False otherwise
        """
        filename = f"load_test_{file_number}_{int(time.time())}.png"

        # Prepare multipart form data
        data = aiohttp.FormData()
        data.add_field(
            'file',
            image_data,
            filename=filename,
            content_type='image/png'
        )

        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }

        start_time = time.time()

        try:
            async with session.post(
                self.upload_endpoint,
                data=data,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=self.timeout_seconds)
            ) as response:
                upload_time = time.time() - start_time
                self.upload_times.append(upload_time)

                if response.status == 201 or response.status == 200:
                    self.success_count += 1
                    result = await response.json()
                    print(f"✅ Upload {file_number}: {upload_time:.2f}s - {result.get('url', 'N/A')}")
                    return True
                else:
                    self.failure_count += 1
                    error_text = await response.text()
                    print(f"❌ Upload {file_number} failed: {response.status} - {error_text[:100]}")

                    if "R2" in error_text or "storage" in error_text.lower():
                        self.r2_errors += 1

                    return False

        except asyncio.TimeoutError:
            upload_time = time.time() - start_time
            self.upload_times.append(upload_time)
            self.failure_count += 1
            self.timeout_errors += 1
            print(f"⏱️  Upload {file_number} timeout after {upload_time:.2f}s")
            return False

        except Exception as e:
            upload_time = time.time() - start_time
            self.upload_times.append(upload_time)
            self.failure_count += 1
            print(f"❌ Upload {file_number} error: {e}")
            return False

    async def run_concurrent_uploads(self):
        """Run concurrent image uploads."""
        print("="*60)
        print("IMAGE UPLOAD LOAD TEST")
        print("="*60)
        print(f"API URL: {self.api_url}")
        print(f"Concurrent Uploads: {self.concurrent_uploads}")
        print(f"Image Size: {self.image_size_mb}MB")
        print(f"Timeout: {self.timeout_seconds}s")
        print("="*60)
        print()

        # Generate test images
        print("🎨 Generating test images...")
        images = []
        for i in range(self.concurrent_uploads):
            image_data, pil_time = self.generate_test_image(self.image_size_mb)
            self.pil_processing_times.append(pil_time)
            images.append(image_data)
            actual_size_mb = len(image_data) / (1024 * 1024)
            print(f"   Image {i+1}: {actual_size_mb:.2f}MB (PIL: {pil_time:.2f}s)")

        print(f"\n✅ Generated {len(images)} test images")
        print()

        # Run concurrent uploads
        print("🚀 Starting concurrent uploads...")
        print()

        start_time = time.time()

        async with aiohttp.ClientSession() as session:
            tasks = [
                self.upload_image(session, image_data, i+1)
                for i, image_data in enumerate(images)
            ]
            results = await asyncio.gather(*tasks)

        elapsed_time = time.time() - start_time

        # Print results
        self.print_results(elapsed_time)

    def print_results(self, elapsed_time: float):
        """Print test results and metrics."""
        print()
        print("="*60)
        print("TEST RESULTS")
        print("="*60)
        print(f"Total Time: {elapsed_time:.2f}s")
        print()

        print("Upload Results:")
        print(f"   ✅ Successful: {self.success_count}/{self.concurrent_uploads}")
        print(f"   ❌ Failed: {self.failure_count}/{self.concurrent_uploads}")
        print(f"   Success Rate: {(self.success_count/self.concurrent_uploads)*100:.1f}%")
        print()

        if self.upload_times:
            print("Upload Performance:")
            print(f"   Mean: {statistics.mean(self.upload_times):.2f}s")
            print(f"   Median: {statistics.median(self.upload_times):.2f}s")
            print(f"   Min: {min(self.upload_times):.2f}s")
            print(f"   Max: {max(self.upload_times):.2f}s")
            if len(self.upload_times) > 1:
                print(f"   Std Dev: {statistics.stdev(self.upload_times):.2f}s")
            print()

        if self.pil_processing_times:
            print("PIL Processing Time:")
            print(f"   Mean: {statistics.mean(self.pil_processing_times):.2f}s")
            print(f"   Max: {max(self.pil_processing_times):.2f}s")
            print()

        if self.r2_errors > 0:
            print(f"⚠️  R2 Storage Errors: {self.r2_errors}")
        if self.timeout_errors > 0:
            print(f"⚠️  Timeout Errors: {self.timeout_errors}")

        print("="*60)
        print("VALIDATION")
        print("="*60)

        # Validate success rate
        success_rate = (self.success_count / self.concurrent_uploads) * 100
        if success_rate >= 90:
            print(f"✅ PASS: Upload success rate ({success_rate:.1f}%) >= 90%")
        else:
            print(f"❌ FAIL: Upload success rate ({success_rate:.1f}%) < 90%")

        # Validate R2 integration
        if self.r2_errors == 0:
            print("✅ PASS: No R2 storage errors")
        else:
            print(f"❌ FAIL: {self.r2_errors} R2 storage errors detected")

        # Validate response times
        if self.upload_times:
            avg_time = statistics.mean(self.upload_times)
            if avg_time < 30:
                print(f"✅ PASS: Average upload time ({avg_time:.2f}s) < 30s")
            else:
                print(f"⚠️  WARNING: Average upload time ({avg_time:.2f}s) >= 30s")

        # Validate no timeouts
        if self.timeout_errors == 0:
            print("✅ PASS: No timeouts occurred")
        else:
            print(f"❌ FAIL: {self.timeout_errors} timeouts occurred")

        # Check backend responsiveness
        print()
        print("Backend Responsiveness Check:")
        print("   Testing if API remains responsive after load...")

        # Make a simple health check
        import requests
        try:
            health_start = time.time()
            response = requests.get(f"{self.api_url}/api/v1/health", timeout=5)
            health_time = time.time() - health_start

            if response.status_code == 200:
                print(f"   ✅ PASS: Backend responsive ({health_time:.2f}s)")
            else:
                print(f"   ❌ FAIL: Backend returned {response.status_code}")
        except Exception as e:
            print(f"   ❌ FAIL: Backend not responsive - {e}")

        print("="*60)
        print()


async def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python test_image_upload_load.py [API_URL] [ADMIN_TOKEN]")
        print()
        print("Example:")
        print("  python test_image_upload_load.py http://localhost:8000 your_jwt_token")
        print()
        print("Note: You need a valid admin JWT token to run this test.")
        print("      Get one by logging in via /api/v1/auth/login")
        sys.exit(1)

    api_url = sys.argv[1]
    admin_token = sys.argv[2] if len(sys.argv) > 2 else ""

    if not admin_token:
        print("⚠️  WARNING: No admin token provided. Test will likely fail.")
        print("   Get a token by logging in: POST /api/v1/auth/login/json")
        print()

    test = ImageUploadLoadTest(api_url, admin_token)
    await test.run_concurrent_uploads()


if __name__ == "__main__":
    asyncio.run(main())
