"""
Pydantic models for deployment metadata and results.

These models track deployment operations, generated files,
and deployment outcomes.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from pathlib import Path
from enum import Enum


class DeploymentStatus(str, Enum):
    """Deployment status enumeration."""
    PENDING = "pending"
    GENERATING = "generating"
    VALIDATING = "validating"
    DEPLOYING = "deploying"
    SUCCESS = "success"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"


class FileType(str, Enum):
    """Generated file type enumeration."""
    ENV = "env"
    DOCKERFILE = "dockerfile"
    DOCKER_COMPOSE = "docker_compose"
    VERCEL_JSON = "vercel_json"
    NGINX_CONFIG = "nginx_config"
    K8S_MANIFEST = "k8s_manifest"
    OTHER = "other"


class GeneratedFile(BaseModel):
    """Metadata about a generated deployment file."""

    path: str = Field(..., description="Absolute path to the generated file")
    file_type: FileType = Field(..., description="Type of generated file")
    target: str = Field(..., description="Deployment target (vercel, docker, etc.)")
    size_bytes: int = Field(..., description="File size in bytes")
    checksum: Optional[str] = Field(
        None,
        description="SHA256 checksum for verification"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when file was generated"
    )

    @classmethod
    def from_path(cls, file_path: Path, file_type: FileType, target: str) -> "GeneratedFile":
        """
        Create GeneratedFile from a file path.

        Args:
            file_path: Path to the generated file
            file_type: Type of file
            target: Deployment target

        Returns:
            GeneratedFile instance
        """
        import hashlib

        # Calculate checksum
        checksum = None
        if file_path.exists():
            with open(file_path, 'rb') as f:
                checksum = hashlib.sha256(f.read()).hexdigest()

        return cls(
            path=str(file_path.absolute()),
            file_type=file_type,
            target=target,
            size_bytes=file_path.stat().st_size if file_path.exists() else 0,
            checksum=checksum
        )


class ValidationError(BaseModel):
    """Validation error details."""

    field: Optional[str] = Field(None, description="Field that failed validation")
    message: str = Field(..., description="Error message")
    severity: str = Field(
        default="error",
        description="Severity level: error, warning, info"
    )


class DeploymentMetadata(BaseModel):
    """Metadata about a deployment operation.

    This tracks the complete deployment lifecycle, including
    configuration, generated files, validation results, and
    deployment outcome.
    """

    environment: str = Field(..., description="Environment name (production, staging)")
    target: str = Field(..., description="Deployment target (vercel, docker)")
    status: DeploymentStatus = Field(
        default=DeploymentStatus.PENDING,
        description="Current deployment status"
    )
    started_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When deployment started"
    )
    completed_at: Optional[datetime] = Field(
        None,
        description="When deployment completed"
    )
    generated_files: List[GeneratedFile] = Field(
        default_factory=list,
        description="Files generated during deployment"
    )
    validation_errors: List[ValidationError] = Field(
        default_factory=list,
        description="Validation errors encountered"
    )
    config_snapshot: Dict[str, Any] = Field(
        default_factory=dict,
        description="Snapshot of configuration used for deployment"
    )
    deployment_url: Optional[str] = Field(
        None,
        description="URL of the deployed application"
    )
    deployment_id: Optional[str] = Field(
        None,
        description="Deployment ID from the platform (Vercel, etc.)"
    )
    logs: List[str] = Field(
        default_factory=list,
        description="Deployment log entries"
    )
    error_message: Optional[str] = Field(
        None,
        description="Error message if deployment failed"
    )

    def add_log(self, message: str):
        """Add a log entry with timestamp."""
        timestamp = datetime.utcnow().isoformat()
        self.logs.append(f"[{timestamp}] {message}")

    def mark_generating(self):
        """Mark deployment as in generating phase."""
        self.status = DeploymentStatus.GENERATING
        self.add_log("Generating configuration files...")

    def mark_validating(self):
        """Mark deployment as in validating phase."""
        self.status = DeploymentStatus.VALIDATING
        self.add_log("Validating configuration...")

    def mark_deploying(self):
        """Mark deployment as in deploying phase."""
        self.status = DeploymentStatus.DEPLOYING
        self.add_log("Deploying to target...")

    def mark_success(self, deployment_url: Optional[str] = None):
        """Mark deployment as successful."""
        self.status = DeploymentStatus.SUCCESS
        self.completed_at = datetime.utcnow()
        if deployment_url:
            self.deployment_url = deployment_url
            self.add_log(f"Deployment successful: {deployment_url}")
        else:
            self.add_log("Deployment successful")

    def mark_failed(self, error: str):
        """Mark deployment as failed."""
        self.status = DeploymentStatus.FAILED
        self.completed_at = datetime.utcnow()
        self.error_message = error
        self.add_log(f"Deployment failed: {error}")

    def add_validation_error(self, message: str, field: Optional[str] = None,
                            severity: str = "error"):
        """Add a validation error."""
        self.validation_errors.append(
            ValidationError(field=field, message=message, severity=severity)
        )

    @property
    def duration_seconds(self) -> Optional[float]:
        """Get deployment duration in seconds."""
        if self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None

    @property
    def is_successful(self) -> bool:
        """Check if deployment was successful."""
        return self.status == DeploymentStatus.SUCCESS

    @property
    def has_errors(self) -> bool:
        """Check if there are validation errors."""
        return any(err.severity == "error" for err in self.validation_errors)


class DeploymentResult(BaseModel):
    """Result of a deployment operation.

    This is the return value from deployment orchestration,
    containing all relevant information about the deployment.
    """

    success: bool = Field(..., description="Whether deployment succeeded")
    metadata: DeploymentMetadata = Field(..., description="Deployment metadata")
    generated_files: List[str] = Field(
        default_factory=list,
        description="Paths to generated files"
    )
    deployment_url: Optional[str] = Field(
        None,
        description="URL where application is deployed"
    )
    message: str = Field(..., description="Human-readable result message")

    @classmethod
    def success_result(
        cls,
        metadata: DeploymentMetadata,
        generated_files: List[str],
        deployment_url: Optional[str] = None
    ) -> "DeploymentResult":
        """Create a successful deployment result."""
        return cls(
            success=True,
            metadata=metadata,
            generated_files=generated_files,
            deployment_url=deployment_url,
            message=f"Deployment to {metadata.target} completed successfully"
        )

    @classmethod
    def failure_result(
        cls,
        metadata: DeploymentMetadata,
        error: str
    ) -> "DeploymentResult":
        """Create a failed deployment result."""
        return cls(
            success=False,
            metadata=metadata,
            message=f"Deployment failed: {error}"
        )

    def print_summary(self):
        """Print a human-readable deployment summary."""
        status_symbol = "✓" if self.success else "✗"
        print(f"\n{status_symbol} Deployment Summary")
        print(f"  Environment: {self.metadata.environment}")
        print(f"  Target: {self.metadata.target}")
        print(f"  Status: {self.metadata.status.value}")

        if self.metadata.duration_seconds:
            print(f"  Duration: {self.metadata.duration_seconds:.2f}s")

        if self.deployment_url:
            print(f"  URL: {self.deployment_url}")

        if self.generated_files:
            print(f"\n  Generated Files:")
            for file_path in self.generated_files:
                print(f"    - {file_path}")

        if self.metadata.validation_errors:
            print(f"\n  Validation Issues:")
            for err in self.metadata.validation_errors:
                print(f"    [{err.severity.upper()}] {err.message}")

        if not self.success and self.metadata.error_message:
            print(f"\n  Error: {self.metadata.error_message}")

        print()
