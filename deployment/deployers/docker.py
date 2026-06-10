from pathlib import Path
from typing import Dict, Any, List
import subprocess
import shutil
from .base import BaseDeployer


class DockerDeployer(BaseDeployer):
    """Deploys application using Docker Compose."""

    def __init__(self, project_root: Path):
        self.project_root = project_root

    def deploy(self, config: Dict[str, Any], generated_files: List[Path]) -> bool:
        """
        Deploy using Docker Compose.

        Args:
            config: Merged configuration dictionary
            generated_files: List of generated file paths

        Returns:
            True if deployment succeeded, False otherwise
        """
        print("\n=== Docker Compose Deployment ===\n")

        # Step 1: Verify Docker is available
        if not self._check_docker():
            print("ERROR: Docker is not available")
            return False

        # Step 2: Copy generated files to project locations
        if not self._copy_files(generated_files):
            print("ERROR: Failed to copy generated files")
            return False

        # Step 3: Find docker-compose.yml
        compose_file = self._find_compose_file(generated_files)
        if not compose_file:
            print("ERROR: docker-compose.yml not found in generated files")
            return False

        # Step 4: Run docker-compose up
        if not self._docker_compose_up(compose_file):
            print("ERROR: docker-compose up failed")
            return False

        # Step 5: Verify services are healthy
        if not self._verify_services(compose_file):
            print("WARNING: Some services may not be healthy")
            print("Run 'docker-compose ps' to check service status")
            return False

        print("\n✓ Deployment successful!")
        print(f"Frontend: http://localhost:3000")
        print(f"Backend API: http://localhost:8000")
        print(f"Backend Docs: http://localhost:8000/docs")
        print("\nTo view logs: docker-compose logs -f")
        print("To stop: docker-compose down")

        return True

    def _check_docker(self) -> bool:
        """Check if Docker and Docker Compose are available."""
        try:
            # Check Docker
            result = subprocess.run(
                ["docker", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode != 0:
                return False

            print(f"✓ Docker: {result.stdout.strip()}")

            # Check Docker Compose
            result = subprocess.run(
                ["docker-compose", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode != 0:
                # Try docker compose (v2 syntax)
                result = subprocess.run(
                    ["docker", "compose", "version"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.returncode != 0:
                    return False

            print(f"✓ Docker Compose: {result.stdout.strip()}")
            return True

        except (subprocess.TimeoutExpired, FileNotFoundError) as e:
            print(f"Docker check failed: {e}")
            return False

    def _copy_files(self, generated_files: List[Path]) -> bool:
        """Copy generated files to project locations."""
        print("\nCopying generated files...")

        file_mappings = {
            "docker-compose.yml": self.project_root / "docker-compose.yml",
            ".env": self.project_root / ".env",
            "backend/.env": self.project_root / "backend" / ".env",
            "frontend/.env.production": self.project_root / "frontend" / ".env.production"
        }

        try:
            for generated_file in generated_files:
                # Skip deployment guide
                if generated_file.name == "DEPLOYMENT.md":
                    continue

                # Determine destination
                for pattern, dest in file_mappings.items():
                    if generated_file.name == Path(pattern).name:
                        # Create parent directory if needed
                        dest.parent.mkdir(parents=True, exist_ok=True)

                        # Copy file
                        shutil.copy2(generated_file, dest)
                        print(f"  ✓ {generated_file.name} -> {dest}")
                        break

            return True

        except Exception as e:
            print(f"  ERROR copying files: {e}")
            return False

    def _find_compose_file(self, generated_files: List[Path]) -> Path:
        """Find docker-compose.yml in generated files."""
        for file_path in generated_files:
            if file_path.name == "docker-compose.yml":
                # Return the copied file in project root
                return self.project_root / "docker-compose.yml"
        return None

    def _docker_compose_up(self, compose_file: Path) -> bool:
        """Run docker-compose up -d."""
        print("\nStarting Docker Compose services...")

        try:
            # Change to project directory
            cmd = ["docker-compose", "-f", str(compose_file), "up", "-d", "--build"]

            print(f"  Running: {' '.join(cmd)}")

            result = subprocess.run(
                cmd,
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=600  # 10 minutes for build + start
            )

            if result.returncode != 0:
                print(f"\nSTDOUT:\n{result.stdout}")
                print(f"\nSTDERR:\n{result.stderr}")
                return False

            print(result.stdout)
            return True

        except subprocess.TimeoutExpired:
            print("  ERROR: docker-compose up timed out (10 minutes)")
            return False
        except Exception as e:
            print(f"  ERROR: {e}")
            return False

    def _verify_services(self, compose_file: Path) -> bool:
        """Verify all services are running and healthy."""
        print("\nVerifying services...")

        try:
            # Wait a bit for health checks
            import time
            print("  Waiting 10 seconds for health checks...")
            time.sleep(10)

            # Check service status
            result = subprocess.run(
                ["docker-compose", "-f", str(compose_file), "ps"],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode != 0:
                print(f"  WARNING: Could not check service status")
                return False

            print(result.stdout)

            # Check if all services are Up
            output = result.stdout.lower()
            if "exit" in output or "restarting" in output:
                print("  WARNING: Some services are not running properly")
                return False

            print("  ✓ All services appear to be running")
            return True

        except Exception as e:
            print(f"  WARNING: Could not verify services: {e}")
            return False
