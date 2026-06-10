"""
Example usage of Pydantic schemas for environment configuration.

This file demonstrates how to use the schemas in the deployment system.
Run with: python -m deployment.schemas.examples
"""

from typing import Dict, Any


def example_environment_config():
    """Example of creating and validating an EnvironmentConfig."""
    from .environment import EnvironmentConfig, EnvironmentMetadata, ValidationRules

    # Create a valid environment configuration
    config = EnvironmentConfig(
        metadata=EnvironmentMetadata(
            name="production",
            description="Production environment",
            deployment_targets=["vercel", "docker"]
        ),
        shared={
            "ENVIRONMENT": "production",
            "SITE_URL": "https://myportfolio.com",
            "BACKEND_URL": "https://api.myportfolio.com",
            "CORS_ORIGINS": "https://myportfolio.com",
            "DATABASE_URL": "postgresql://user:pass@host:5432/db",
        },
        targets={
            "vercel": {
                "NEXT_PUBLIC_API_URL": "https://api.myportfolio.com",
                "NODE_ENV": "production",
            },
            "docker": {
                "BACKEND_HOST": "0.0.0.0",
                "BACKEND_PORT": 8000,
            }
        },
        validation=ValidationRules(
            required_vars=["SITE_URL", "BACKEND_URL", "DATABASE_URL"],
            https_required=["SITE_URL", "BACKEND_URL"],
            no_localhost_in=["SITE_URL", "BACKEND_URL"],
        )
    )

    print("Environment Config created successfully!")
    print(f"  Name: {config.metadata.name}")
    print(f"  Targets: {config.metadata.deployment_targets}")
    print(f"  Required vars: {config.validation.required_vars}")

    # Get merged config for a specific target
    merged = config.get_merged_config('vercel')
    print(f"\nMerged config for 'vercel' target:")
    for key, value in merged.items():
        print(f"  {key} = {value}")

    return config


def example_deployment_metadata():
    """Example of tracking deployment metadata."""
    from .deployment import DeploymentMetadata, GeneratedFile, FileType
    from pathlib import Path

    # Create deployment metadata
    metadata = DeploymentMetadata(
        environment="production",
        target="vercel",
        config_snapshot={
            "SITE_URL": "https://myportfolio.com",
            "BACKEND_URL": "https://api.myportfolio.com",
        }
    )

    print("\nDeployment Metadata created!")
    print(f"  Environment: {metadata.environment}")
    print(f"  Target: {metadata.target}")
    print(f"  Status: {metadata.status.value}")

    # Track deployment progress
    metadata.mark_generating()
    print("\n[1] Generating configuration files...")

    # Add a generated file
    metadata.generated_files.append(
        GeneratedFile(
            path="/home/user/project/generated/vercel/.env",
            file_type=FileType.ENV,
            target="vercel",
            size_bytes=1024,
            checksum="abc123def456"
        )
    )

    metadata.mark_validating()
    print("[2] Validating configuration...")

    metadata.mark_deploying()
    print("[3] Deploying to Vercel...")

    # Mark as successful
    metadata.mark_success(deployment_url="https://myportfolio.vercel.app")
    print(f"[4] Deployment successful!")
    print(f"    URL: {metadata.deployment_url}")
    print(f"    Duration: {metadata.duration_seconds:.2f}s")

    return metadata


def example_deployment_result():
    """Example of creating a deployment result."""
    from .deployment import DeploymentMetadata, DeploymentResult

    metadata = DeploymentMetadata(
        environment="production",
        target="docker"
    )
    metadata.mark_success(deployment_url="https://api.myportfolio.com")

    result = DeploymentResult.success_result(
        metadata=metadata,
        generated_files=[
            "/home/user/project/generated/docker/.env",
            "/home/user/project/generated/docker/Dockerfile",
            "/home/user/project/generated/docker/docker-compose.yml",
        ],
        deployment_url="https://api.myportfolio.com"
    )

    print("\nDeployment Result:")
    result.print_summary()

    return result


def example_validation_error():
    """Example of handling validation errors."""
    from .deployment import DeploymentMetadata, DeploymentResult

    metadata = DeploymentMetadata(
        environment="production",
        target="vercel"
    )

    # Add validation errors
    metadata.add_validation_error(
        "SITE_URL must use HTTPS in production",
        field="SITE_URL",
        severity="error"
    )
    metadata.add_validation_error(
        "DATABASE_URL is not set",
        field="DATABASE_URL",
        severity="error"
    )
    metadata.add_validation_error(
        "Consider using environment-specific cache settings",
        severity="warning"
    )

    metadata.mark_failed("Validation failed with 2 errors")

    result = DeploymentResult.failure_result(
        metadata=metadata,
        error="Validation failed"
    )

    print("\nDeployment with Validation Errors:")
    result.print_summary()

    return result


if __name__ == "__main__":
    print("=" * 60)
    print("Pydantic Schema Examples")
    print("=" * 60)

    try:
        print("\n1. Environment Configuration")
        print("-" * 60)
        example_environment_config()

        print("\n2. Deployment Metadata Tracking")
        print("-" * 60)
        example_deployment_metadata()

        print("\n3. Successful Deployment Result")
        print("-" * 60)
        example_deployment_result()

        print("\n4. Failed Deployment with Validation Errors")
        print("-" * 60)
        example_validation_error()

        print("\n" + "=" * 60)
        print("All examples completed successfully!")
        print("=" * 60)

    except ImportError as e:
        print(f"\nError: {e}")
        print("\nPlease install required dependencies:")
        print("  pip install pydantic")
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
