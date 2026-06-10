# Environment Configuration

This directory contains environment-specific configuration files for the Portfolio application. All deployment targets (Vercel, Docker, Cloud Run) are configured using these centralized TOML files.

## File Structure

```
deployment/environments/
├── production.toml      # Production environment config
├── staging.toml         # Staging environment config
├── development.toml     # Local development config
├── .secrets.toml        # Secrets file (GITIGNORED - never commit!)
└── README.md            # This file
```

## Configuration Format

Each environment TOML file has the following structure:

### 1. Metadata Section

```toml
[metadata]
name = "production"
description = "Production environment for ldj.heistats.com"
deployment_targets = ["vercel", "docker", "cloudrun"]
```

Describes the environment and which deployment targets it supports.

### 2. Shared Section

```toml
[shared]
SITE_NAME = "lengedandungjoshua"
ENVIRONMENT = "production"
SECRET_KEY = "${SECRET_KEY}"  # References .secrets.toml
# ... more common variables
```

Variables that are **common across all deployment targets** (Vercel, Docker, Cloud Run).

### 3. Target-Specific Sections

```toml
[targets.vercel]
SITE_URL = "https://ldj.heistats.com"
DATABASE_URL = "${NEON_DATABASE_URL}"  # Neon for Vercel

[targets.docker]
SITE_URL = "https://ldj.heistats.com"
# Docker uses component-based DB config
[targets.docker.database]
DB_HOST = "portfolio_db"
DB_USER = "postgres"

[targets.cloudrun]
SITE_URL = "https://ldj-cloudrun.heistats.com"
DATABASE_URL = "${CLOUDSQL_DATABASE_URL}"  # Cloud SQL
```

Each deployment target can override or add variables specific to that platform.

### 4. Validation Section

```toml
[validation]
required_vars = ["SECRET_KEY", "ADMIN_PASSWORD"]
no_localhost_in = ["SITE_URL", "CORS_ORIGINS"]
no_empty_in_production = ["SECRET_KEY", "DATABASE_URL"]
https_required = ["SITE_URL", "R2_PUBLIC_URL"]
```

Validation rules enforced by `deployment.py validate`.

## Secret References

### Using `${SECRET_NAME}` Syntax

Environment configs use `${VAR_NAME}` to reference secrets from `.secrets.toml`:

**In production.toml:**
```toml
[shared]
SECRET_KEY = "${SECRET_KEY}"
ADMIN_PASSWORD = "${ADMIN_PASSWORD}"

[shared.cloudflare_r2]
R2_ACCOUNT_ID = "${R2_ACCOUNT_ID}"
R2_ACCESS_KEY_ID = "${R2_ACCESS_KEY_ID}"
```

**In .secrets.toml:**
```toml
SECRET_KEY = "actual-secret-value-here"
ADMIN_PASSWORD = "actual-password-here"
R2_ACCOUNT_ID = "dc1bb7cac9ba1b75378730f204322781"
R2_ACCESS_KEY_ID = "2f355a6724e4ac1bd9b45aaf03a57008"
```

When `deployment.py` loads the config, it automatically resolves these references.

### Creating Your .secrets.toml

1. **Copy the template:**
   ```bash
   cp .secrets.toml.template .secrets.toml
   ```

2. **Generate secure keys:**
   ```bash
   # Generate SECRET_KEY
   python -c "import secrets; print(secrets.token_hex(32))"
   
   # Generate ADMIN_PASSWORD
   python -c "import secrets; print(secrets.token_urlsafe(24))"
   ```

3. **Add your secrets:**
   Edit `.secrets.toml` and replace all `changeme-*` values with actual credentials.

4. **Verify it's gitignored:**
   ```bash
   git status  # Should NOT show .secrets.toml
   ```

## Required Secrets by Environment

### Production

Required in `.secrets.toml` for production deployment:

- `SECRET_KEY` - JWT signing key
- `ADMIN_PASSWORD` - Admin panel password
- `R2_ACCOUNT_ID` - Cloudflare R2 account ID
- `R2_ACCESS_KEY_ID` - R2 access key
- `R2_SECRET_ACCESS_KEY` - R2 secret key
- `NEON_DATABASE_URL` - Neon PostgreSQL URL (for Vercel)
- `POSTGRES_PASSWORD` - PostgreSQL password (for Docker)
- `REDIS_PASSWORD` - Redis password (for Docker)
- `CLOUDSQL_DATABASE_URL` - Cloud SQL URL (for Cloud Run)
- `SENTRY_DSN` - Sentry error tracking DSN (optional)

### Staging

Required in `.secrets.toml` for staging:

- `STAGING_SECRET_KEY` - Different key than production
- `STAGING_DATABASE_URL` - Separate staging database
- `STAGING_POSTGRES_PASSWORD`
- `STAGING_REDIS_PASSWORD`
- `STAGING_CLOUDSQL_DATABASE_URL`
- Same R2 credentials (or separate bucket)

### Development

Development uses mostly default values. Optional secrets:
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` (for testing R2)

Default dev values are in `development.toml` (no secrets required for basic local dev).

## Using the Configs

### 1. Validate Configuration

Check that an environment config is valid:

```bash
python deployment.py validate --env production
```

This checks:
- All required secrets are present
- No localhost in production URLs
- HTTPS used for production URLs
- Database is configured
- CORS includes SITE_URL

### 2. Generate Deployment Files

Generate deployment configs for a specific target:

```bash
# Generate Vercel configs
python deployment.py generate --target vercel --env production

# Generate Docker configs
python deployment.py generate --target docker --env production

# Generate Cloud Run configs
python deployment.py generate --target cloudrun --env staging
```

This creates:
- `.env` files for frontend/backend
- Platform-specific configs (vercel.json, docker-compose.yml, etc.)
- Deployment instructions

### 3. Deploy

Generate configs and deploy in one command:

```bash
python deployment.py deploy --target vercel --env production
```

### 4. List Available Environments

```bash
python deployment.py list-envs
```

Shows: `production`, `staging`, `development`

## Environment-Specific Notes

### Production

- **Strictest validation** - no localhost, HTTPS required
- **Three deployment targets:** Vercel (primary), Docker (backup), Cloud Run (alternative)
- **Vercel specifics:**
  - Uses Neon serverless PostgreSQL
  - No Redis (in-memory fallback)
  - Same-origin API (NEXT_PUBLIC_API_URL = "")
- **Docker specifics:**
  - Uses PostgreSQL container
  - Uses Redis container
  - Separate API domain (api.ldj.heistats.com)

### Staging

- **Less strict validation** - for testing
- **Separate database** - never touch production data
- **Can use Vercel preview deployments** or dedicated staging server
- **Full tracing enabled** - Sentry sample rate = 1.0

### Development

- **No validation** - localhost allowed
- **Default credentials** - admin/admin123
- **Local database** - postgresql://postgres:postgres@localhost:5432/portfolio
- **No Redis required** - optional for testing
- **HTTP allowed** - http://localhost:3000

## Config Hierarchy

When loading a target config, the deployment tool merges configs in this order:

1. **Shared section** - common variables
2. **Target section** - override/add target-specific vars
3. **Secret resolution** - resolve ${VAR} references

Example for Vercel production:

```toml
# Step 1: Load shared
ENVIRONMENT = "production"
SECRET_KEY = "${SECRET_KEY}"
SITE_NAME = "lengedandungjoshua"

# Step 2: Merge target-specific
SITE_URL = "https://ldj.heistats.com"  # from targets.vercel
DATABASE_URL = "${NEON_DATABASE_URL}"  # from targets.vercel

# Step 3: Resolve secrets
SECRET_KEY = "ac8f9b2e..."  # from .secrets.toml
DATABASE_URL = "postgresql://..."  # from .secrets.toml
```

## Modifying Configurations

### Adding a New Variable

1. **Add to shared section** if common across all targets:
   ```toml
   [shared]
   NEW_FEATURE_FLAG = true
   ```

2. **Add to target section** if platform-specific:
   ```toml
   [targets.vercel]
   VERCEL_SPECIFIC_VAR = "value"
   ```

3. **If it's a secret**, add reference:
   ```toml
   [shared]
   NEW_API_KEY = "${NEW_API_KEY}"
   ```
   
   Then add actual value to `.secrets.toml`:
   ```toml
   NEW_API_KEY = "actual-key-here"
   ```

### Changing a URL

1. Edit the TOML file:
   ```toml
   [targets.vercel]
   SITE_URL = "https://new-domain.com"
   CORS_ORIGINS = "https://new-domain.com"
   ```

2. Regenerate configs:
   ```bash
   python deployment.py generate --target vercel --env production
   ```

3. Redeploy:
   ```bash
   python deployment.py deploy --target vercel --env production
   ```

### Adding a New Environment

Create a new TOML file (e.g., `qa.toml`):

```toml
[metadata]
name = "qa"
description = "QA testing environment"
deployment_targets = ["docker"]

[shared]
ENVIRONMENT = "qa"
# ... rest of config
```

Add QA secrets to `.secrets.toml`:
```toml
QA_SECRET_KEY = "..."
QA_DATABASE_URL = "..."
```

## Security Best Practices

1. **NEVER commit .secrets.toml** - it's in .gitignore, keep it that way
2. **Use different secrets per environment** - don't reuse production keys in staging
3. **Rotate secrets regularly** - especially after team member departures
4. **Use strong passwords** - minimum 24 characters for SECRET_KEY
5. **Restrict database access** - use read-only credentials where possible
6. **Enable Sentry** - for production error tracking
7. **Validate before deploy** - always run `python deployment.py validate` first

## Troubleshooting

### "Secret not found: SECRET_KEY"

You haven't created `.secrets.toml` or it's missing that secret.

**Fix:**
```bash
cp .secrets.toml.template .secrets.toml
# Edit .secrets.toml and add the missing secret
```

### "CORS_ORIGINS contains localhost in production"

Your production config has a localhost URL.

**Fix:** Edit `production.toml` and ensure all URLs use production domains:
```toml
CORS_ORIGINS = "https://ldj.heistats.com"  # Not localhost!
```

### "Environment config not found: custom.toml"

The environment doesn't exist.

**Fix:** Create it or use an existing one:
```bash
python deployment.py list-envs  # See available environments
```

### Generated .env files have empty values

A secret reference `${VAR}` couldn't be resolved.

**Fix:** Add the missing secret to `.secrets.toml`:
```toml
VAR = "actual-value"
```

## Examples

### Example 1: Deploy to Vercel Production

```bash
# 1. Ensure secrets are configured
vi deployment/environments/.secrets.toml

# 2. Validate configuration
python deployment.py validate --env production

# 3. Generate and review configs
python deployment.py generate --target vercel --env production --output generated/vercel

# 4. Deploy
python deployment.py deploy --target vercel --env production
```

### Example 2: Test Locally

```bash
# 1. Generate local .env files
python deployment.py generate --target local --env development

# 2. Start services
cd frontend && npm run dev
cd backend && uvicorn app.main:app --reload
```

### Example 3: Staging Deployment

```bash
# 1. Set staging secrets in .secrets.toml
# 2. Validate
python deployment.py validate --env staging

# 3. Deploy to staging
python deployment.py deploy --target vercel --env staging
```

## Integration with Source Code

The source code has been updated to **fail fast** if environment variables are missing in production:

- **Frontend** (`frontend/src/lib/config.ts`): Throws error if `NEXT_PUBLIC_API_URL` not set
- **Backend** (`backend/app/core/config.py`): Validates CORS, SITE_URL, etc. at startup
- **Build time** (`frontend/next.config.js`): Validates required vars before build

This ensures you **cannot accidentally deploy** with localhost or missing configs.

## Migration from Old .env Files

If you have existing `.env` files:

1. **Extract secrets:**
   ```bash
   grep -E "(SECRET_KEY|PASSWORD|API_KEY|DSN)" backend/.env >> .secrets.toml
   ```

2. **Add non-secret config to TOML:**
   ```bash
   # Edit production.toml and add values from .env
   ```

3. **Test the new config:**
   ```bash
   python deployment.py validate --env production
   python deployment.py generate --target vercel --env production
   ```

4. **Delete old .env files** (after successful deploy):
   ```bash
   rm backend/.env backend/.env.production frontend/.env.local
   ```

## Support

For issues or questions:

1. Check this README first
2. Validate your config: `python deployment.py validate --env <env-name>`
3. Check generated files in `generated/` directory
4. Review deployment logs
5. Check application logs for startup validation errors

---

**Remember:** This centralized configuration system prevents localhost leaks, ensures consistent deployments, and makes environment management transparent. Always use `deployment.py` instead of manually editing .env files or deployment configs.
