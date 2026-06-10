"""
Pydantic models for environment configuration validation.

These models validate the structure of TOML configuration files,
ensuring all required fields are present and correctly typed.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Dict, Any, List, Optional


class ValidationRules(BaseModel):
    """Validation rules for environment configuration."""

    required_vars: List[str] = Field(
        default_factory=list,
        description="List of required environment variables"
    )
    no_localhost_in: List[str] = Field(
        default_factory=list,
        description="Variables that must not contain localhost in production"
    )
    no_empty_in_production: List[str] = Field(
        default_factory=list,
        description="Variables that must not be empty in production"
    )
    https_required: List[str] = Field(
        default_factory=list,
        description="Variables that must use HTTPS in production"
    )


class EnvironmentMetadata(BaseModel):
    """Metadata about the environment configuration."""

    name: str = Field(..., description="Environment name (e.g., production, staging)")
    description: str = Field(..., description="Human-readable description")
    deployment_targets: List[str] = Field(
        ...,
        description="List of deployment targets (e.g., vercel, docker, cloudrun)"
    )

    @field_validator('deployment_targets')
    @classmethod
    def validate_targets(cls, v):
        """Validate deployment targets are supported."""
        supported = {'vercel', 'docker', 'cloudrun'}
        invalid = set(v) - supported
        if invalid:
            raise ValueError(
                f"Unsupported deployment targets: {invalid}. "
                f"Supported: {supported}"
            )
        return v


class SharedConfig(BaseModel):
    """Shared configuration values across all deployment targets."""

    # Allow any fields with dynamic keys
    model_config = {"extra": "allow"}

    ENVIRONMENT: str = Field(..., description="Environment name")
    SITE_URL: str = Field(..., description="Site URL")
    CORS_ORIGINS: str = Field(..., description="Comma-separated CORS origins")

    @field_validator('SITE_URL')
    @classmethod
    def validate_site_url(cls, v):
        """Validate SITE_URL format."""
        if not v.startswith(('http://', 'https://')):
            raise ValueError("SITE_URL must start with http:// or https://")
        return v


class TargetConfig(BaseModel):
    """Target-specific configuration overrides."""

    # Allow any fields with dynamic keys
    model_config = {"extra": "allow"}


class EnvironmentConfig(BaseModel):
    """Complete environment configuration structure.

    This model validates the entire TOML configuration file structure,
    ensuring all required sections are present and valid.

    Example:
        ```toml
        [metadata]
        name = "production"
        description = "Production environment"
        deployment_targets = ["vercel", "docker"]

        [shared]
        ENVIRONMENT = "production"
        SITE_URL = "https://mysite.com"
        CORS_ORIGINS = "https://mysite.com"

        [targets.vercel]
        BACKEND_URL = "https://api.mysite.com"

        [targets.docker]
        BACKEND_URL = "http://backend:8000"

        [validation]
        required_vars = ["SITE_URL", "BACKEND_URL"]
        https_required = ["SITE_URL"]
        ```
    """

    metadata: EnvironmentMetadata = Field(..., description="Environment metadata")
    shared: Dict[str, Any] = Field(
        ...,
        description="Shared configuration values across all targets"
    )
    targets: Dict[str, Dict[str, Any]] = Field(
        default_factory=dict,
        description="Target-specific configuration overrides"
    )
    validation: ValidationRules = Field(
        default_factory=ValidationRules,
        description="Validation rules for the environment"
    )

    @field_validator('targets')
    @classmethod
    def validate_targets_match_metadata(cls, v, info):
        """Ensure targets match those declared in metadata."""
        if 'metadata' in info.data:
            declared_targets = set(info.data['metadata'].deployment_targets)
            actual_targets = set(v.keys())

            # Warn about missing target configs (not an error - they'll use shared only)
            missing = declared_targets - actual_targets
            if missing:
                print(f"Warning: No target configs for: {missing} (will use shared config only)")

            # Error on undeclared targets
            undeclared = actual_targets - declared_targets
            if undeclared:
                raise ValueError(
                    f"Undeclared targets in config: {undeclared}. "
                    f"Add them to metadata.deployment_targets"
                )

        return v

    def get_merged_config(self, target: str) -> Dict[str, Any]:
        """
        Get merged configuration for a specific target.

        Args:
            target: Target name (e.g., 'vercel', 'docker')

        Returns:
            Merged configuration dictionary (shared + target-specific)

        Raises:
            ValueError: If target is not in declared deployment targets
        """
        if target not in self.metadata.deployment_targets:
            raise ValueError(
                f"Target '{target}' not in deployment_targets. "
                f"Available: {self.metadata.deployment_targets}"
            )

        merged = dict(self.shared)

        if target in self.targets:
            merged.update(self.targets[target])

        return merged

    def get_flat_config(self, target: Optional[str] = None) -> Dict[str, Any]:
        """
        Get flattened configuration with all nested values expanded.

        Args:
            target: Optional target name for target-specific config

        Returns:
            Flattened configuration dictionary
        """
        if target:
            config = self.get_merged_config(target)
        else:
            config = dict(self.shared)

        return self._flatten_dict(config)

    def _flatten_dict(self, d: Dict, parent_key: str = '') -> Dict:
        """Recursively flatten nested dictionary."""
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}.{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(self._flatten_dict(v, new_key).items())
            else:
                items.append((k, v))
        return dict(items)
