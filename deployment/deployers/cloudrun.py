import subprocess
import shutil
from pathlib import Path
from typing import Dict, Any, List
from .base import BaseDeployer


class CloudRunDeployer(BaseDeployer):
    """Deploys application to Google Cloud Run."""

    def __init__(self, project_root: Path):
        self.project_root = project_root

    def deploy(self, config: Dict[str, Any], generated_files: List[Path]) -> bool:
        """
        Deploy to Google Cloud Run.

        Steps:
        1. Check if gcloud CLI is installed
        2. Verify authentication and project setup
        3. Copy Dockerfiles to service directories
        4. Build and push backend container
        5. Deploy backend to Cloud Run
        6. Build and push frontend container
        7. Deploy frontend to Cloud Run
        8. Display service URLs

        Args:
            config: Merged configuration dictionary
            generated_files: List of generated file paths

        Returns:
            True if deployment succeeded, False otherwise
        """
        print("\n=== Google Cloud Run Deployment ===\n")

        try:
            # Step 1: Check gcloud CLI
            if not self._check_gcloud_cli():
                print("ERROR: gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install")
                return False

            # Step 2: Verify project configuration
            gcp_project = config.get('GCP_PROJECT_ID')
            region = config.get('GCP_REGION', 'us-central1')

            if not gcp_project:
                print("ERROR: GCP_PROJECT_ID not set in configuration")
                return False

            if not self._verify_project_config(gcp_project, region):
                print(f"ERROR: Failed to verify project configuration")
                print(f"Run: gcloud config set project {gcp_project}")
                return False

            # Step 3: Copy Dockerfiles
            if not self._copy_dockerfiles(generated_files):
                print("ERROR: Failed to copy Dockerfiles")
                return False

            # Step 4: Build and deploy backend
            if not self._build_and_deploy_backend(config, gcp_project, region):
                print("ERROR: Backend deployment failed")
                return False

            # Step 5: Build and deploy frontend
            if not self._build_and_deploy_frontend(config, gcp_project, region):
                print("ERROR: Frontend deployment failed")
                return False

            # Step 6: Display service URLs
            self._display_service_urls(gcp_project, region)

            print("\n✓ Deployment to Cloud Run completed successfully!")
            return True

        except Exception as e:
            print(f"✗ Deployment error: {e}")
            return False

    def _check_gcloud_cli(self) -> bool:
        """Check if gcloud CLI is installed."""
        if shutil.which('gcloud') is None:
            return False

        try:
            result = subprocess.run(
                ['gcloud', '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                print(f"✓ gcloud CLI installed")
                return True
            return False
        except Exception:
            return False

    def _verify_project_config(self, project_id: str, region: str) -> bool:
        """Verify gcloud is authenticated and project is set."""
        try:
            # Check current project
            result = subprocess.run(
                ['gcloud', 'config', 'get-value', 'project'],
                capture_output=True,
                text=True,
                timeout=5
            )

            if result.returncode != 0:
                print("  ERROR: Failed to get current project")
                return False

            current_project = result.stdout.strip()

            # Set project if different
            if current_project != project_id:
                print(f"  Setting project to: {project_id}")
                result = subprocess.run(
                    ['gcloud', 'config', 'set', 'project', project_id],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                if result.returncode != 0:
                    print(f"  ERROR: Failed to set project: {result.stderr}")
                    return False

            print(f"✓ Using GCP project: {project_id}")
            print(f"✓ Using region: {region}")
            return True

        except Exception as e:
            print(f"  ERROR verifying project: {e}")
            return False

    def _copy_dockerfiles(self, generated_files: List[Path]) -> bool:
        """Copy generated Dockerfiles to service directories."""
        print("\nCopying Dockerfiles...")

        file_mappings = {
            "backend.Dockerfile": self.project_root / "backend" / "Dockerfile.cloudrun",
            "frontend.Dockerfile": self.project_root / "frontend" / "Dockerfile.cloudrun"
        }

        try:
            for generated_file in generated_files:
                if generated_file.name in file_mappings:
                    dest = file_mappings[generated_file.name]
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(generated_file, dest)
                    print(f"  ✓ {generated_file.name} -> {dest}")

            return True

        except Exception as e:
            print(f"  ERROR copying files: {e}")
            return False

    def _build_and_deploy_backend(self, config: Dict, project_id: str, region: str) -> bool:
        """Build and deploy backend service to Cloud Run."""
        print("\n--- Backend Deployment ---")

        image_name = f"{region}-docker.pkg.dev/{project_id}/portfolio/backend:latest"

        # Build container
        print(f"\n1. Building backend container: {image_name}")

        build_cmd = [
            'gcloud', 'builds', 'submit',
            str(self.project_root / 'backend'),
            '--tag', image_name,
            '--timeout', '20m'
        ]

        # Check if custom Dockerfile exists
        cloudrun_dockerfile = self.project_root / 'backend' / 'Dockerfile.cloudrun'
        if cloudrun_dockerfile.exists():
            build_cmd.extend(['--dockerfile', 'Dockerfile.cloudrun'])

        try:
            result = subprocess.run(
                build_cmd,
                cwd=self.project_root,
                capture_output=False,  # Show output in real-time
                timeout=1200  # 20 minutes
            )

            if result.returncode != 0:
                print("  ✗ Backend build failed")
                return False

            print("  ✓ Backend container built successfully")

        except subprocess.TimeoutExpired:
            print("  ✗ Backend build timed out (20 minutes)")
            return False
        except Exception as e:
            print(f"  ✗ Backend build error: {e}")
            return False

        # Deploy to Cloud Run
        print(f"\n2. Deploying backend to Cloud Run...")

        deploy_cmd = [
            'gcloud', 'run', 'deploy', 'portfolio-backend',
            '--image', image_name,
            '--platform', 'managed',
            '--region', region,
            '--allow-unauthenticated',
            '--min-instances', '1',
            '--max-instances', '10',
            '--cpu', '2',
            '--memory', '2Gi',
            '--timeout', '300',
            '--set-env-vars', f"ENVIRONMENT={config.get('ENVIRONMENT', 'production')}",
            '--set-env-vars', f"CORS_ORIGINS={config.get('CORS_ORIGINS', '')}",
            '--set-env-vars', f"SITE_URL={config.get('SITE_URL', '')}",
            '--set-env-vars', f"SITE_NAME={config.get('SITE_NAME', 'Portfolio')}",
            '--set-env-vars', f"ALGORITHM={config.get('ALGORITHM', 'HS256')}",
            '--set-env-vars', f"ACCESS_TOKEN_EXPIRE_MINUTES={config.get('ACCESS_TOKEN_EXPIRE_MINUTES', '30')}",
            '--set-env-vars', f"R2_ACCOUNT_ID={config.get('R2_ACCOUNT_ID', '')}",
            '--set-env-vars', f"R2_BUCKET_NAME={config.get('R2_BUCKET_NAME', '')}",
            '--set-env-vars', f"R2_PUBLIC_URL={config.get('R2_PUBLIC_URL', '')}",
            '--set-env-vars', f"RATE_LIMIT_PER_MINUTE={config.get('RATE_LIMIT_PER_MINUTE', '60')}"
        ]

        # Add secrets if they exist
        print("  Note: Sensitive values should be set as secrets in Google Secret Manager")
        print("  See DEPLOYMENT.md for instructions on setting up secrets")

        try:
            result = subprocess.run(
                deploy_cmd,
                cwd=self.project_root,
                capture_output=False,  # Show output in real-time
                timeout=300  # 5 minutes
            )

            if result.returncode != 0:
                print("  ✗ Backend deployment failed")
                return False

            print("  ✓ Backend deployed successfully")
            return True

        except subprocess.TimeoutExpired:
            print("  ✗ Backend deployment timed out (5 minutes)")
            return False
        except Exception as e:
            print(f"  ✗ Backend deployment error: {e}")
            return False

    def _build_and_deploy_frontend(self, config: Dict, project_id: str, region: str) -> bool:
        """Build and deploy frontend service to Cloud Run."""
        print("\n--- Frontend Deployment ---")

        image_name = f"{region}-docker.pkg.dev/{project_id}/portfolio/frontend:latest"

        # Build container with build args
        print(f"\n1. Building frontend container: {image_name}")

        build_cmd = [
            'gcloud', 'builds', 'submit',
            str(self.project_root / 'frontend'),
            '--tag', image_name,
            '--timeout', '20m'
        ]

        # Check if custom Dockerfile exists
        cloudrun_dockerfile = self.project_root / 'frontend' / 'Dockerfile.cloudrun'
        if cloudrun_dockerfile.exists():
            build_cmd.extend(['--dockerfile', 'Dockerfile.cloudrun'])

        # Add build args for Next.js public variables
        build_args = [
            f"NEXT_PUBLIC_API_URL={config.get('NEXT_PUBLIC_API_URL', '')}",
            f"NEXT_PUBLIC_SITE_URL={config.get('NEXT_PUBLIC_SITE_URL', '')}",
        ]

        if config.get('NEXT_PUBLIC_SENTRY_DSN'):
            build_args.append(f"NEXT_PUBLIC_SENTRY_DSN={config.get('NEXT_PUBLIC_SENTRY_DSN')}")
        if config.get('NEXT_PUBLIC_GA_ID'):
            build_args.append(f"NEXT_PUBLIC_GA_ID={config.get('NEXT_PUBLIC_GA_ID')}")
        if config.get('NEXT_PUBLIC_PLAUSIBLE_DOMAIN'):
            build_args.append(f"NEXT_PUBLIC_PLAUSIBLE_DOMAIN={config.get('NEXT_PUBLIC_PLAUSIBLE_DOMAIN')}")

        # Add substitutions for build args
        substitutions = ','.join([f"_{key.replace('=', '=')}".replace('=', '=') for key in build_args])
        if substitutions:
            build_cmd.extend(['--substitutions', substitutions])

        try:
            result = subprocess.run(
                build_cmd,
                cwd=self.project_root,
                capture_output=False,  # Show output in real-time
                timeout=1200  # 20 minutes
            )

            if result.returncode != 0:
                print("  ✗ Frontend build failed")
                return False

            print("  ✓ Frontend container built successfully")

        except subprocess.TimeoutExpired:
            print("  ✗ Frontend build timed out (20 minutes)")
            return False
        except Exception as e:
            print(f"  ✗ Frontend build error: {e}")
            return False

        # Deploy to Cloud Run
        print(f"\n2. Deploying frontend to Cloud Run...")

        deploy_cmd = [
            'gcloud', 'run', 'deploy', 'portfolio-frontend',
            '--image', image_name,
            '--platform', 'managed',
            '--region', region,
            '--allow-unauthenticated',
            '--min-instances', '1',
            '--max-instances', '10',
            '--cpu', '2',
            '--memory', '1Gi',
            '--timeout', '300',
            '--set-env-vars', 'NODE_ENV=production',
            '--set-env-vars', f"NEXT_PUBLIC_API_URL={config.get('NEXT_PUBLIC_API_URL', '')}",
            '--set-env-vars', f"NEXT_PUBLIC_SITE_URL={config.get('NEXT_PUBLIC_SITE_URL', '')}"
        ]

        # Add optional public env vars
        if config.get('NEXT_PUBLIC_SENTRY_DSN'):
            deploy_cmd.extend(['--set-env-vars', f"NEXT_PUBLIC_SENTRY_DSN={config.get('NEXT_PUBLIC_SENTRY_DSN')}"])
        if config.get('NEXT_PUBLIC_GA_ID'):
            deploy_cmd.extend(['--set-env-vars', f"NEXT_PUBLIC_GA_ID={config.get('NEXT_PUBLIC_GA_ID')}"])
        if config.get('NEXT_PUBLIC_PLAUSIBLE_DOMAIN'):
            deploy_cmd.extend(['--set-env-vars', f"NEXT_PUBLIC_PLAUSIBLE_DOMAIN={config.get('NEXT_PUBLIC_PLAUSIBLE_DOMAIN')}"])

        try:
            result = subprocess.run(
                deploy_cmd,
                cwd=self.project_root,
                capture_output=False,  # Show output in real-time
                timeout=300  # 5 minutes
            )

            if result.returncode != 0:
                print("  ✗ Frontend deployment failed")
                return False

            print("  ✓ Frontend deployed successfully")
            return True

        except subprocess.TimeoutExpired:
            print("  ✗ Frontend deployment timed out (5 minutes)")
            return False
        except Exception as e:
            print(f"  ✗ Frontend deployment error: {e}")
            return False

    def _display_service_urls(self, project_id: str, region: str):
        """Display deployed service URLs."""
        print("\n=== Service URLs ===\n")

        services = ['portfolio-backend', 'portfolio-frontend']

        for service in services:
            try:
                result = subprocess.run(
                    ['gcloud', 'run', 'services', 'describe', service,
                     '--platform', 'managed',
                     '--region', region,
                     '--format', 'value(status.url)'],
                    capture_output=True,
                    text=True,
                    timeout=10
                )

                if result.returncode == 0:
                    url = result.stdout.strip()
                    service_type = "Backend" if "backend" in service else "Frontend"
                    print(f"{service_type}: {url}")

                    if "backend" in service:
                        print(f"  API Docs: {url}/docs")
                        print(f"  Health: {url}/health")

            except Exception as e:
                print(f"  Could not get URL for {service}: {e}")

        print("\n=== Monitoring ===\n")
        print(f"Cloud Console: https://console.cloud.google.com/run?project={project_id}")
        print(f"Logs: https://console.cloud.google.com/logs/query?project={project_id}")
        print(f"\nView logs: gcloud run logs tail portfolio-backend --region {region}")
        print(f"View logs: gcloud run logs tail portfolio-frontend --region {region}")
