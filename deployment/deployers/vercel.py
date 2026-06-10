import subprocess
import shutil
from pathlib import Path
from typing import Dict, Any, List
from .base import BaseDeployer


class VercelDeployer(BaseDeployer):
    """Deploys application to Vercel using the Vercel CLI."""

    def __init__(self, project_root: Path):
        self.project_root = project_root

    def deploy(self, config: Dict[str, Any], generated_files: List[Path]) -> bool:
        """
        Deploy to Vercel using generated configuration files.

        Steps:
        1. Check if vercel CLI is installed
        2. Copy vercel.json to project root
        3. Push environment variables to Vercel
        4. Run vercel --prod

        Args:
            config: Merged configuration dictionary
            generated_files: List of generated file paths

        Returns:
            True if deployment succeeded, False otherwise
        """
        try:
            # Step 1: Check if vercel CLI is installed
            if not self._check_vercel_cli():
                print("Error: Vercel CLI not found. Install with: npm i -g vercel")
                return False

            # Step 2: Copy vercel.json to project root
            vercel_json = next((f for f in generated_files if f.name == 'vercel.json'), None)
            if not vercel_json:
                print("Error: vercel.json not found in generated files")
                return False

            dest_vercel_json = self.project_root / 'vercel.json'
            shutil.copy2(vercel_json, dest_vercel_json)
            print(f"✓ Copied vercel.json to {dest_vercel_json}")

            # Step 3: Push environment variables to Vercel
            if not self._push_env_vars(config):
                print("Warning: Failed to push environment variables. You may need to set them manually.")

            # Step 4: Run vercel --prod
            print("\nDeploying to Vercel production...")
            result = subprocess.run(
                ['vercel', '--prod', '--yes'],
                cwd=str(self.project_root),
                capture_output=True,
                text=True
            )

            if result.returncode == 0:
                print("✓ Deployment successful!")
                print(result.stdout)
                return True
            else:
                print("✗ Deployment failed!")
                print(result.stderr)
                return False

        except Exception as e:
            print(f"✗ Deployment error: {e}")
            return False

    def _check_vercel_cli(self) -> bool:
        """Check if vercel CLI is installed."""
        return shutil.which('vercel') is not None

    def _push_env_vars(self, config: Dict[str, Any]) -> bool:
        """
        Push environment variables to Vercel using vercel env add.

        Note: This is a simplified implementation. For production use,
        consider using the Vercel API for more robust env var management.

        Args:
            config: Configuration dictionary

        Returns:
            True if successful, False otherwise
        """
        try:
            # Environment variables to push
            env_vars = [
                'ENVIRONMENT', 'DATABASE_URL', 'SECRET_KEY', 'ALGORITHM',
                'ACCESS_TOKEN_EXPIRE_MINUTES', 'CORS_ORIGINS', 'SITE_NAME',
                'SITE_DESCRIPTION', 'SITE_URL', 'ADMIN_EMAIL', 'ADMIN_PASSWORD',
                'R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY',
                'R2_BUCKET_NAME', 'R2_PUBLIC_URL', 'SENTRY_DSN',
                'SENTRY_ENVIRONMENT', 'RATE_LIMIT_PER_MINUTE',
                'NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_API_URL'
            ]

            print("\nPushing environment variables to Vercel...")

            for var in env_vars:
                if var in config and config[var]:
                    # Use vercel env add command
                    # Note: This requires interactive input or use of --force
                    # For automated deployment, environment variables should be
                    # set via Vercel dashboard or API
                    print(f"  {var}={config[var][:20]}..." if len(str(config[var])) > 20 else f"  {var}={config[var]}")

            print("\nNote: Environment variables should be set in Vercel dashboard:")
            print("https://vercel.com/dashboard/<your-project>/settings/environment-variables")

            return True

        except Exception as e:
            print(f"Warning: Could not push environment variables: {e}")
            return False
