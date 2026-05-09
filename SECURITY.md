# Security Guidelines

## 🔒 Credential Management

### Environment Variables

**NEVER commit the following files to git:**
- `.env`
- `.env.local`
- `.env.production`
- `.env.*.local`
- Any file containing actual passwords, API keys, or secrets

**Safe to commit:**
- `.env.example`
- `.env.production.example`
- `backend/.env.example`
- `frontend/.env.example`

These example files should only contain placeholder values like `CHANGE_ME_*` or empty values.

### Generating Secure Credentials

Before deploying to production, generate secure credentials:

```bash
# For database passwords and API keys (32 bytes)
openssl rand -base64 32

# For JWT SECRET_KEY (48 bytes)
openssl rand -base64 48

# Alternative using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Production Deployment Checklist

Before deploying to production:

1. **Copy the example file:**
   ```bash
   cp .env.production.example .env.production
   ```

2. **Replace ALL placeholder values:**
   - `DB_PASSWORD` - Use `openssl rand -base64 32`
   - `REDIS_PASSWORD` - Use `openssl rand -base64 32`
   - `SECRET_KEY` - Use `openssl rand -base64 48`
   - `CORS_ORIGINS` - Replace with your actual domain(s)
   - `SITE_URL` - Replace with your actual domain
   - `NEXT_PUBLIC_API_URL` - Replace with your actual domain
   - `SENTRY_DSN` - Get from your Sentry project settings

3. **Verify .gitignore:**
   ```bash
   # Check that .env.production is ignored
   git check-ignore .env.production
   # Should output: .env.production
   ```

4. **Never commit production credentials:**
   ```bash
   # This should show no .env files with actual values
   git status
   ```

## 🚨 Security Incident Response

If credentials are accidentally committed:

1. **Immediately rotate ALL exposed credentials**
2. **Remove from git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.production" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push (coordinate with team first):**
   ```bash
   git push origin --force --all
   ```
4. **Update all deployment environments with new credentials**

## 🛡️ Development Best Practices

### Local Development

- Use weak/simple passwords for local development (e.g., `portfolio`, `postgres`)
- Never use production credentials locally
- Keep `backend/.env` and `frontend/.env.local` in `.gitignore`

### Code Reviews

Before merging PRs, verify:
- No hardcoded credentials in source code
- No committed `.env` files (except `.env.example`)
- No API keys in configuration files
- No database passwords in connection strings
- No JWT secrets in code

### Database Credentials

**Bad:**
```python
DATABASE_URL = "postgresql://user:password123@localhost/db"
```

**Good:**
```python
DB_PASSWORD: str  # No default, must be provided via environment
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
```

### API Keys and Secrets

**Bad:**
```javascript
const API_KEY = "sk-1234567890abcdef";
```

**Good:**
```javascript
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is required");
}
```

## 🔍 Security Scanning

### Manual Audit

Search for potential credential leaks:

```bash
# Search for hardcoded passwords
grep -r "password.*=.*['\"]" --include="*.py" --include="*.js" \
  --exclude-dir=node_modules --exclude-dir=.next

# Search for API keys
grep -r "api[_-]key.*=.*['\"]" --include="*.py" --include="*.js" \
  --exclude-dir=node_modules

# Search for connection strings with credentials
grep -rE "(postgres|mysql)://[^/]*:[^@]*@" --include="*.py" --include="*.js"

# Check what's tracked in git
git ls-tree -r HEAD --name-only | grep -E "\.env|credential|secret|password"
```

### Git History Audit

```bash
# Check if .env files were ever committed
git log --all --full-history --source -- "*.env" ".env*"

# Search commit history for sensitive keywords
git log -p | grep -i "password\|secret\|api_key" | head -20
```

## 📋 Credential Inventory

Track where credentials are used:

| Credential | Used By | Storage | Rotation Schedule |
|------------|---------|---------|-------------------|
| `DB_PASSWORD` | Backend, Docker | `.env`, `.env.production` | Quarterly |
| `REDIS_PASSWORD` | Backend, Docker | `.env.production` | Quarterly |
| `SECRET_KEY` | Backend JWT | `.env`, `.env.production` | Annually |
| `SENTRY_DSN` | Frontend, Backend | `.env.production` | On compromise |

## 🔐 Access Control

### Production Server Access

- Use SSH keys only (disable password authentication)
- Implement least privilege principle
- Use a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.) for production
- Rotate credentials on employee departure
- Enable MFA on all cloud provider accounts

### Database Access

- Use strong passwords (minimum 32 characters)
- Restrict network access (firewall rules)
- Use read-only credentials for analytics
- Enable audit logging
- Regular credential rotation

## 📞 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email security concerns to: lengedandungjoshua@gmail.com
3. Include detailed reproduction steps
4. Allow 48 hours for initial response

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [git-secrets](https://github.com/awslabs/git-secrets) - Prevent committing secrets
