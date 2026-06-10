# Deployment System

Centralized deployment orchestration for the Portfolio application. This package provides tools to generate deployment configurations from TOML files, removing environment-specific values from source code.

## Overview

The deployment system uses a configuration-driven approach:

1. **TOML Configs** - Environment configs in `deployment/environments/`
2. **Secret Management** - Secrets stored in `.secrets.toml` (never committed)
3. **Code Generation** - Generates target-specific configs (.env, Dockerfile, etc.)
4. **Validation** - Validates configs before deployment
5. **Orchestration** - Deploys to target platforms (Vercel, Docker, Cloud Run)

### Key Benefits

- Single source of truth for environment configuration
- No hardcoded URLs or secrets in source code
- Environment-specific overrides per deployment target
- Validation prevents common deployment mistakes
- Automated config generation reduces manual errors

## Quick Start

### 1. Install Dependencies

```bash
pip install tomli pydantic
```

### 2. Create Environment Config

Create `deployment/environments/production.toml`:

```toml
[metadata]
name = "production"
description = "Production environment"
deployment_targets = ["vercel", "docker"]

[shared]
ENVIRONMENT = "production"
SITE_URL = "https://myportfolio.com"
CORS_ORIGINS = "https://myportfolio.com"
API_PREFIX = "/api"

[targets.vercel]
BACKEND_URL = "https://api.myportfolio.com"
NODE_ENV = "production"

[targets.docker]
BACKEND_URL = "http://backend:8000"
NODE_ENV = "production"

[validation]
required_vars = ["SITE_URL", "BACKEND_URL", "DATABASE_URL"]
https_required = ["SITE_URL", "BACKEND_URL"]
no_localhost_in = ["SITE_URL", "BACKEND_URL"]
no_empty_in_production = ["DATABASE_URL", "JWT_SECRET_KEY"]
```

### 3. Create Secrets File

Create `deployment/environments/.secrets.toml` (NEVER commit this):

```toml
DATABASE_URL = "postgresql://user:password@host:5432/dbname"
JWT_SECRET_KEY = "super-secret-key-change-me"
CLOUDFLARE_ACCESS_KEY = "your-cloudflare-key"
CLOUDFLARE_SECRET_KEY = "your-cloudflare-secret"
```

### 4. Deploy

```bash
# Deploy to Vercel
python deployment.py production vercel

# Deploy to Docker
python deployment.py production docker

# Dry run (validate only)
python deployment.py production vercel --dry-run
```

## Architecture

### Directory Structure

```
deployment/
├── __init__.py                 # Package initialization
├── config_loader.py            # TOML config loader with secret resolution
├── validators.py               # Configuration validation
│
├── schemas/                    # Pydantic models
│   ├── __init__.py
│   ├── environment.py          # EnvironmentConfig models
│   └── deployment.py           # DeploymentMetadata models
│
├── generators/                 # Config file generators
│   ├── __init__.py
│   ├── base.py                 # BaseGenerator abstract class
│   ├── vercel.py               # Generates .env for Vercel
│   ├── docker.py               # Generates Dockerfile, docker-compose.yml
│   └── cloudrun.py             # Generates Cloud Run configs
│
├── deployers/                  # Platform deployers
│   ├── __init__.py
│   ├── base.py                 # BaseDeployer abstract class
│   ├── vercel.py               # Vercel CLI deployer
│   ├── docker.py               # Docker build/push deployer
│   └── cloudrun.py             # Cloud Run gcloud deployer
│
├── templates/                  # Jinja2 templates
│   ├── Dockerfile.j2
│   ├── docker-compose.yml.j2
│   ├── nginx.conf.j2
│   └── vercel.json.j2
│
└── environments/               # Environment configs
    ├── production.toml
    ├── staging.toml
    ├── development.toml
    └── .secrets.toml           # NEVER COMMIT
```

### Component Flow

```
┌─────────────────┐
│  Environment    │
│  Config (TOML)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ConfigLoader   │ ← Loads TOML, resolves ${SECRETS}
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pydantic       │ ← Validates structure
│  Validation     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Environment    │ ← Validates deployment rules
│  Validator      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Generator      │ ← Generates .env, Dockerfile, etc.
│  (Target-spec)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deployer       │ ← Deploys to platform
│  (Target-spec)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deployment     │
│  Result         │
└─────────────────┘
```

## CLI Usage

### Deploy Command

```bash
python deployment.py <environment> <target> [options]
```

**Arguments:**
- `environment`: Environment name (production, staging, development)
- `target`: Deployment target (vercel, docker, cloudrun)

**Options:**
- `--dry-run`: Validate and generate configs without deploying
- `--force`: Skip validation errors (not recommended)
- `--output-dir`: Custom output directory for generated files
- `--verbose`: Enable verbose logging

### Examples

```bash
# Deploy production to Vercel
python deployment.py production vercel

# Validate staging Docker config (dry run)
python deployment.py staging docker --dry-run

# Deploy with verbose logging
python deployment.py production vercel --verbose

# Generate configs to custom directory
python deployment.py production docker --output-dir ./build
```

## Configuration Guide

### Environment Config Structure

```toml
[metadata]
name = "environment-name"
description = "Human-readable description"
deployment_targets = ["vercel", "docker", "cloudrun"]

[shared]
# Variables shared across all deployment targets
ENVIRONMENT = "production"
SITE_URL = "https://example.com"
VARIABLE_NAME = "value"
SECRET_REF = "${SECRET_NAME}"  # Reference to .secrets.toml

[targets.vercel]
# Vercel-specific overrides
BACKEND_URL = "https://api.example.com"

[targets.docker]
# Docker-specific overrides
BACKEND_URL = "http://backend:8000"

[targets.cloudrun]
# Cloud Run-specific overrides
BACKEND_URL = "https://backend-service-xyz.run.app"

[validation]
required_vars = ["SITE_URL", "DATABASE_URL"]
https_required = ["SITE_URL", "BACKEND_URL"]
no_localhost_in = ["SITE_URL"]
no_empty_in_production = ["DATABASE_URL", "JWT_SECRET_KEY"]
```

### Secret References

Use `${SECRET_NAME}` syntax to reference secrets from `.secrets.toml`:

```toml
# In environment config
[shared]
DATABASE_URL = "${DATABASE_URL}"
JWT_SECRET_KEY = "${JWT_SECRET_KEY}"

# In .secrets.toml
DATABASE_URL = "postgresql://user:pass@host:5432/db"
JWT_SECRET_KEY = "my-secret-key"
```

### Validation Rules

- `required_vars`: Variables that must exist and be non-empty
- `https_required`: Variables that must start with `https://`
- `no_localhost_in`: Variables that cannot contain localhost/127.0.0.1
- `no_empty_in_production`: Variables that cannot be empty in production

## Adding New Deployment Targets

### 1. Create Generator

Create `deployment/generators/<target>.py`:

```python
from pathlib import Path
from typing import Dict, Any, List
from .base import BaseGenerator

class MyTargetGenerator(BaseGenerator):
    """Generator for MyTarget platform."""

    def generate(self, config: Dict[str, Any]) -> List[Path]:
        """Generate MyTarget configuration files."""
        generated_files = []

        # Merge shared + target-specific config
        merged = self._merge_config(config, 'mytarget')

        # Generate .env file
        env_file = self.output_dir / '.env'
        with open(env_file, 'w') as f:
            for key, value in merged.items():
                f.write(f"{key}={value}\n")
        generated_files.append(env_file)

        # Generate other config files as needed
        # ...

        return generated_files
```

### 2. Create Deployer

Create `deployment/deployers/<target>.py`:

```python
from typing import Dict, Any, List
from pathlib import Path
from .base import BaseDeployer

class MyTargetDeployer(BaseDeployer):
    """Deployer for MyTarget platform."""

    def deploy(self, config: Dict[str, Any], generated_files: List[Path]) -> bool:
        """Deploy to MyTarget platform."""
        try:
            # Use platform CLI or API to deploy
            # Example: subprocess.run(['mytarget-cli', 'deploy'])
            print(f"Deploying to MyTarget...")
            return True
        except Exception as e:
            print(f"Deployment failed: {e}")
            return False
```

### 3. Register in Orchestrator

Update `deployment.py` to include your target:

```python
from deployment.generators.mytarget import MyTargetGenerator
from deployment.deployers.mytarget import MyTargetDeployer

GENERATORS = {
    'vercel': VercelGenerator,
    'docker': DockerGenerator,
    'mytarget': MyTargetGenerator,  # Add here
}

DEPLOYERS = {
    'vercel': VercelDeployer,
    'docker': DockerDeployer,
    'mytarget': MyTargetDeployer,  # Add here
}
```

### 4. Update Environment Config

Add target to your environment TOML:

```toml
[metadata]
deployment_targets = ["vercel", "docker", "mytarget"]

[targets.mytarget]
CUSTOM_VAR = "mytarget-specific-value"
```

## Pydantic Schemas

The deployment system uses Pydantic for configuration validation:

### EnvironmentConfig

Validates TOML structure:

```python
from deployment.schemas import EnvironmentConfig

config = EnvironmentConfig(
    metadata=EnvironmentMetadata(
        name="production",
        description="Production environment",
        deployment_targets=["vercel"]
    ),
    shared={
        "ENVIRONMENT": "production",
        "SITE_URL": "https://example.com"
    },
    targets={
        "vercel": {
            "BACKEND_URL": "https://api.example.com"
        }
    },
    validation=ValidationRules(
        required_vars=["SITE_URL"],
        https_required=["SITE_URL"]
    )
)

# Get merged config for target
merged = config.get_merged_config('vercel')
```

### DeploymentMetadata

Tracks deployment progress:

```python
from deployment.schemas import DeploymentMetadata, DeploymentStatus

metadata = DeploymentMetadata(
    environment="production",
    target="vercel"
)

metadata.mark_generating()
metadata.add_log("Generating configuration...")
metadata.mark_deploying()
metadata.mark_success(deployment_url="https://app.vercel.app")

print(f"Deployment took {metadata.duration_seconds}s")
```

## Best Practices

### Security

1. **Never commit `.secrets.toml`** - Add to .gitignore
2. **Use secret references** - Don't hardcode secrets in environment configs
3. **Rotate secrets regularly** - Update .secrets.toml and redeploy
4. **Limit access** - Restrict who can access .secrets.toml

### Configuration Management

1. **One config per environment** - Separate production.toml, staging.toml, etc.
2. **Use shared for common values** - Reduce duplication
3. **Use targets for platform-specific** - Override only what's different
4. **Document validation rules** - Make deployment requirements clear

### Deployment Workflow

1. **Always dry-run first** - Validate before deploying
2. **Review generated files** - Check output in `generated/` directory
3. **Test in staging** - Deploy to staging before production
4. **Monitor deployments** - Check logs and deployment URLs
5. **Have rollback plan** - Know how to revert if needed

## Troubleshooting

### Common Issues

**Issue: Secret not found**
```
ValueError: Secret not found: DATABASE_URL
```
**Solution:** Add the secret to `deployment/environments/.secrets.toml`

**Issue: Validation error**
```
Error: SITE_URL must use HTTPS in production
```
**Solution:** Update the URL in your environment config to use `https://`

**Issue: Target not found**
```
ValueError: Target 'vercel' not in deployment_targets
```
**Solution:** Add the target to `metadata.deployment_targets` in your TOML config

**Issue: File not found**
```
FileNotFoundError: Environment config not found
```
**Solution:** Create the environment TOML file in `deployment/environments/`

### Debug Mode

Enable verbose logging to see detailed output:

```bash
python deployment.py production vercel --verbose
```

### Validating Configs

Run dry-run to validate without deploying:

```bash
python deployment.py production vercel --dry-run
```

## Migration from .env Files

If you're currently using .env files:

### 1. Consolidate Variables

Create a TOML config with all your environment variables:

```toml
[shared]
VARIABLE_1 = "value1"
VARIABLE_2 = "value2"
```

### 2. Extract Secrets

Move sensitive values to `.secrets.toml`:

```toml
# In environment config
DATABASE_URL = "${DATABASE_URL}"

# In .secrets.toml
DATABASE_URL = "postgresql://..."
```

### 3. Add Target Overrides

If different platforms need different values:

```toml
[targets.vercel]
BACKEND_URL = "https://api.vercel.app"

[targets.docker]
BACKEND_URL = "http://backend:8000"
```

### 4. Deprecate Old .env Files

Update .gitignore to ignore legacy .env files:

```
# Legacy .env files (use deployment.py instead)
.env
.env.local
.env.production
```

## Contributing

When adding new features:

1. Update Pydantic schemas in `deployment/schemas/`
2. Add validation rules in `deployment/validators.py`
3. Create generator for new platforms in `deployment/generators/`
4. Create deployer for new platforms in `deployment/deployers/`
5. Update this README with usage examples
6. Add tests for new functionality

## Version History

- **1.0.0** - Initial release with Vercel, Docker, Cloud Run support
