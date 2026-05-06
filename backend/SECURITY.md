# Security Documentation

This document outlines the security measures implemented in the portfolio application.

## Authentication Security

### 1. JWT Token-Based Authentication
- **Implementation**: JWT tokens with bcrypt password hashing
- **Token Expiration**: Configurable via `ACCESS_TOKEN_EXPIRE_MINUTES` (default: 30 minutes)
- **Secret Key**: Strong secret key from environment variable `SECRET_KEY`
- **Algorithm**: HS256 for token signing

### 2. Password Security
- **Hashing**: Bcrypt with automatic salt generation
- **Storage**: Only hashed passwords stored in database, never plaintext
- **Verification**: Constant-time comparison to prevent timing attacks

### 3. Rate Limiting
- **Login Endpoints**: Protected against brute force attacks
  - **Per Minute**: Maximum 5 login attempts
  - **Per Hour**: Maximum 20 login attempts
- **Implementation**: IP-based tracking with automatic cleanup
- **Response**: HTTP 429 (Too Many Requests) with retry-after headers

### 4. SQL Injection Protection
- **ORM**: SQLAlchemy with parameterized queries throughout
- **No Raw SQL**: All database queries use ORM methods
- **Validation**: Pydantic schemas validate all input data

### 5. Environment-Based Configuration
- **Admin Credentials**: Must be set via environment variables
  - `ADMIN_EMAIL`: Admin user email address
  - `ADMIN_PASSWORD`: Admin user password (hashed before storage)
- **No Hardcoded Credentials**: All sensitive data from `.env` file
- **Secret Key**: Must be set via `SECRET_KEY` environment variable

## Authorization

### 1. Role-Based Access Control
- **Admin Endpoints**: Protected by `AdminUser` dependency
- **User Flag**: `is_superuser` flag in database determines admin access
- **Active Status**: `is_active` flag must be true for authentication

### 2. Token Validation
- **Bearer Token**: Required for all protected endpoints
- **Expiration Check**: Tokens expire after configured time
- **Signature Verification**: All tokens validated against secret key

## Input Validation

### 1. Pydantic Schemas
- **Type Safety**: All request/response data validated
- **Field Validation**: Length limits, format checks, required fields
- **Automatic Sanitization**: Type coercion and validation

### 2. File Upload Security
- **Extension Whitelist**: Only allowed image formats (jpg, jpeg, png, gif, webp)
- **Size Limits**: Configurable max upload size (default: 10MB)
- **Path Safety**: Uploads stored in dedicated directory with safe filenames

## CORS Configuration

### 1. Origin Control
- **Whitelist**: Only specified origins allowed via `CORS_ORIGINS`
- **Production**: Must be configured for production domain
- **Development**: localhost:3000 by default

## Network Security

### 1. HTTPS/TLS
- **Production**: Let's Encrypt SSL certificates required
- **Automatic Renewal**: Setup script configures auto-renewal
- **Certificate Storage**: Secure certificate directory with proper permissions

### 2. Nginx Security Headers
- **X-Frame-Options**: Prevent clickjacking (DENY)
- **X-Content-Type-Options**: Prevent MIME-type sniffing (nosniff)
- **X-XSS-Protection**: Enable XSS filtering (1; mode=block)
- **Rate Limiting**: Configured at reverse proxy level

### 3. API Rate Limiting (Nginx)
- **General**: 50 requests/second per IP
- **API Endpoints**: 10 requests/second per IP
- **Login Endpoints**: Additional application-level rate limiting

## Session Security

### 1. JWT Tokens
- **Stateless**: No server-side session storage
- **Client Storage**: Frontend stores token in memory (not localStorage)
- **Logout**: Client-side token removal

### 2. Token Claims
- **Subject**: User email address
- **Expiration**: Automatic expiration timestamp
- **Type**: Bearer token type

## Admin Panel Security

### 1. Route Protection
- **Authentication Required**: All admin routes check for valid JWT
- **Automatic Redirect**: Unauthenticated users redirected to login
- **Token Verification**: Backend validates token on every request

### 2. robots.txt
- **Disallow Admin**: Search engines blocked from `/admin/` routes
- **Disallow API**: Search engines blocked from `/api/` routes

## Database Security

### 1. Connection Security
- **Credentials**: Database credentials from environment variables
- **Connection String**: Built dynamically from components
- **No Exposed Passwords**: Never logged or exposed in errors

### 2. Data Protection
- **Password Hashing**: All passwords hashed with bcrypt
- **Sensitive Data**: API keys and secrets in environment only
- **Migrations**: Alembic migrations tracked and versioned

## Security Checklist for Production

- [ ] Generate strong `SECRET_KEY` (32+ random bytes)
- [ ] Set strong `ADMIN_PASSWORD` (16+ characters, mixed case, symbols)
- [ ] Set proper `ADMIN_EMAIL` for admin user
- [ ] Configure `CORS_ORIGINS` for production domain
- [ ] Set up SSL/TLS certificates with Let's Encrypt
- [ ] Configure Nginx security headers
- [ ] Set up database backups
- [ ] Review and test rate limiting settings
- [ ] Enable monitoring and logging
- [ ] Set up fail2ban or similar intrusion prevention
- [ ] Regular security updates for dependencies
- [ ] Regular security audits

## Reporting Security Issues

If you discover a security vulnerability, please email: security@yourdomain.com

**Do not** create public GitHub issues for security vulnerabilities.

## Privacy & Data Collection

### Visitor Tracking
- **Purpose**: Anonymous analytics to understand site usage and visitor geography
- **Data Collected**: IP address, country, region, city, ISP, page views, user agent
- **Retention**: Configurable cleanup (default: 365 days)
- **Bot Detection**: Automatic filtering of search engine bots and crawlers
- **Admin Only**: Analytics visible only to authenticated admin users
- **No Personal Data**: No user accounts, cookies, or tracking across sessions
- **Third-Party**: Uses ip-api.com free tier for geolocation (45 req/min limit)

### Data Security
- **IP Anonymization**: IPs used only for geolocation, can be anonymized if required
- **Database Storage**: All visitor data stored securely in PostgreSQL
- **Access Control**: Analytics endpoints require admin authentication
- **GDPR Compliance**: Visitor tracking can be disabled if needed

## Security Updates

- **2026-05-06**: Added visitor tracking system with geographic analytics
- **2026-05-06**: Added login rate limiting (5/min, 20/hour)
- **2026-05-06**: Removed hardcoded admin email, moved to environment variables
- **2026-05-06**: Added comprehensive security documentation
