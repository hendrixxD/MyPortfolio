# Quick Deployment Checklist ✅

## Pre-Deployment (5 minutes)

```bash
# 1. Navigate to project root
cd /home/hendrixx/Desktop/MyPortfolio

# 2. Run production setup script
./scripts/setup-production.sh

# Select option 2: Setup production configuration
# Enter your domain when prompted
# Script auto-generates secure passwords

# 3. Verify configuration
./scripts/setup-production.sh
# Select option 1: Check for placeholders
# Should see: "Configuration looks good!"

# 4. Review critical files
cat .env.production | grep -E "PASSWORD|SECRET_KEY|DOMAIN"
```

## Deployment (10 minutes)

```bash
# 1. Initialize SSL certificates
./scripts/init-ssl.sh yourdomain.com your@email.com

# 2. Build and start all services
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 3. Check all services are healthy
docker-compose -f docker-compose.prod.yml ps
# Wait until all show "Up (healthy)"

# 4. Check logs for errors
docker-compose -f docker-compose.prod.yml logs backend | grep -i error
docker-compose -f docker-compose.prod.yml logs frontend | grep -i error
```

## Verification (5 minutes)

```bash
# Backend health check
curl https://yourdomain.com/api/health
# Expected: {"status":"healthy"}

# Frontend check
curl -I https://yourdomain.com/
# Expected: HTTP/2 200

# SSL certificate check
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com | grep "Verify return code"
# Expected: Verify return code: 0 (ok)

# Security headers check
curl -I https://yourdomain.com/ | grep -E "Content-Security-Policy|X-Frame-Options"
# Expected: Both headers present
```

## Post-Deployment Testing

**Browser Tests**:
1. Visit https://yourdomain.com (should load with HTTPS)
2. Open DevTools → Application → Cookies
3. Login to admin panel
4. Verify `access_token` cookie with HttpOnly ✓
5. Check localStorage is empty (no auth tokens)
6. Test contact form submission
7. Test file upload in admin gallery

**Security Tests**:
```bash
# Test XSS prevention (contact form)
# Submit: <script>alert('xss')</script>
# Expected: Sanitized, no script execution

# Test file upload limits
# Upload file > 5MB
# Expected: Rejected with error message

# Test rate limiting
for i in {1..100}; do curl -I https://yourdomain.com/api/health; done
# Expected: 429 after threshold
```

## Troubleshooting

**Services won't start**:
```bash
docker-compose -f docker-compose.prod.yml logs
```

**SSL certificate issues**:
```bash
docker-compose -f docker-compose.prod.yml run --rm certbot renew
docker-compose -f docker-compose.prod.yml restart nginx
```

**Database connection errors**:
```bash
docker-compose -f docker-compose.prod.yml exec db pg_isready -U portfolio_user
```

**Backend API errors**:
```bash
docker-compose -f docker-compose.prod.yml logs backend -f
```

## Rollback Procedure

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restore backup configuration
cp .env.production.backup .env.production

# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

---

**Total Time**: ~20 minutes  
**Status**: Phase 1 Security Fixes Complete ✅  
**Ready**: Production Deployment
