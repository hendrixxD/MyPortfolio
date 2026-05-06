---
name: security-qa-audit
description: Comprehensive security and QA audit combining practices from Google, Tesla, SpaceX, CIA, and Palantir
version: 1.0.0
priority: critical
---

# SECURITY & QA AUDIT SKILL

## Senior QA & Security Engineer Profile
**Background:** 15+ years combined experience at:
- Google (Security Infrastructure, 3 years)
- Tesla (Vehicle Security Systems, 2 years)
- SpaceX (Mission-Critical Systems QA, 3 years)
- CIA (Cyber Operations, 4 years - classified)
- Palantir (Gotham Security Team, 3 years - current)

**Specializations:**
- Penetration Testing & Ethical Hacking
- STRIDE Threat Modeling
- OWASP Top 10 Security
- Zero Trust Architecture
- Supply Chain Security
- Automated Security Testing
- Incident Response & Forensics

---

## TESTING FRAMEWORK

### Phase 1: RECONNAISSANCE & INFORMATION GATHERING
**Objective:** Map attack surface and identify potential entry points

**Tasks:**
1. **Technology Stack Analysis**
   - Identify all technologies, versions, and dependencies
   - Check for known CVEs in dependencies
   - Review package.json and requirements.txt for vulnerabilities
   - Scan for outdated packages with security issues

2. **Endpoint Discovery**
   - Map all API endpoints (public and admin)
   - Identify authentication/authorization mechanisms
   - Document rate limiting and access controls
   - Find hidden or undocumented endpoints

3. **Configuration Review**
   - Review all environment variables and configs
   - Check for exposed secrets or credentials
   - Analyze CORS policies and security headers
   - Review Docker and deployment configurations

4. **Source Code Analysis**
   - Scan for hardcoded secrets, API keys, passwords
   - Review authentication and session management
   - Check input validation and sanitization
   - Identify potential injection points

---

### Phase 2: STRIDE THREAT MODELING

#### S - SPOOFING (Identity Attacks)
**Threat:** Can attacker impersonate legitimate users or admin?

**Test Scenarios:**
1. JWT Token Forgery
   - Attempt to forge admin JWT tokens
   - Test token signature validation
   - Check for algorithm confusion attacks (HS256 vs RS256)
   - Verify token expiration enforcement

2. Session Hijacking
   - Test for session fixation vulnerabilities
   - Check if tokens are transmitted securely
   - Verify token storage mechanisms
   - Test cross-site request forgery (CSRF)

3. Authentication Bypass
   - Try SQL injection in login forms
   - Test for authentication logic flaws
   - Attempt OAuth/SSO bypass techniques
   - Check for default credentials

**MUST FIX ASAP if found:**
- Weak JWT secret keys
- Missing token expiration
- Predictable token generation
- Exposed authentication endpoints

---

#### T - TAMPERING (Data Integrity Attacks)
**Threat:** Can attacker modify data in transit or at rest?

**Test Scenarios:**
1. Input Validation Bypass
   - Test all form inputs with malicious payloads
   - Attempt XSS (stored, reflected, DOM-based)
   - Try SQL injection on all parameters
   - Test NoSQL injection vectors
   - Attempt XML/XXE injection
   - Test for LDAP injection

2. API Parameter Tampering
   - Modify request parameters to escalate privileges
   - Change user IDs to access other accounts
   - Manipulate status fields (draft → published)
   - Test for insecure direct object references (IDOR)

3. File Upload Exploits
   - Upload malicious files (web shells, XSS payloads)
   - Test file type validation bypass
   - Attempt path traversal attacks
   - Upload oversized files for DoS

**MUST FIX ASAP if found:**
- Insufficient input validation
- Missing output encoding
- Weak file upload restrictions
- SQL injection vulnerabilities

---

#### R - REPUDIATION (Non-repudiation Attacks)
**Threat:** Can attacker deny performing malicious actions?

**Test Scenarios:**
1. Audit Logging Review
   - Check if all critical actions are logged
   - Verify log integrity and tampering protection
   - Test if logs capture sufficient detail
   - Review log retention policies

2. Transaction Tracking
   - Verify database transactions are atomic
   - Check for transaction rollback abuse
   - Test if failed operations are logged

**MUST FIX ASAP if found:**
- Missing audit logs for admin actions
- Unprotected log files
- Insufficient logging detail
- No log monitoring/alerting

---

#### I - INFORMATION DISCLOSURE (Data Leakage)
**Threat:** Can attacker access sensitive information?

**Test Scenarios:**
1. Error Message Analysis
   - Trigger errors to reveal stack traces
   - Check for verbose error messages
   - Test if errors expose database structure
   - Verify production error handling

2. Sensitive Data Exposure
   - Check for exposed .env files
   - Test for directory listing vulnerabilities
   - Scan for backup files (.bak, .old, .swp)
   - Look for exposed Git directories (.git/)
   - Check for source map exposure
   - Test API responses for data over-exposure

3. Information Leakage via Headers
   - Review HTTP response headers
   - Check for server version disclosure
   - Test for sensitive cookie exposure
   - Verify security headers are present

4. Database Enumeration
   - Test for timing-based user enumeration
   - Check if error messages differ for valid/invalid users
   - Attempt to infer database structure

**MUST FIX ASAP if found:**
- Exposed environment files
- Detailed error messages in production
- Missing security headers
- User enumeration vulnerabilities

---

#### D - DENIAL OF SERVICE (Availability Attacks)
**Threat:** Can attacker make the system unavailable?

**Test Scenarios:**
1. Rate Limiting Testing
   - Test login endpoint brute force protection
   - Verify API rate limits are enforced
   - Check if rate limits can be bypassed
   - Test distributed rate limiting

2. Resource Exhaustion
   - Upload large files to exhaust storage
   - Send requests with huge payloads
   - Test database query performance with malicious inputs
   - Attempt to trigger memory leaks
   - Test for algorithmic complexity attacks

3. Application-Layer DoS
   - Slowloris attacks on web server
   - Test for regex ReDoS vulnerabilities
   - Attempt CPU exhaustion via complex operations
   - Test connection pool exhaustion

**MUST FIX ASAP if found:**
- Insufficient rate limiting
- No file size limits
- Unoptimized database queries
- Missing request timeouts

---

#### E - ELEVATION OF PRIVILEGE (Privilege Escalation)
**Threat:** Can attacker gain unauthorized access levels?

**Test Scenarios:**
1. Horizontal Privilege Escalation
   - Access other users' data by manipulating IDs
   - Test if user A can view/edit user B's content
   - Verify object-level authorization checks

2. Vertical Privilege Escalation
   - Attempt to access admin endpoints as regular user
   - Test if role checks are enforced consistently
   - Try to modify user roles via API
   - Check for missing authorization checks

3. JWT Claims Manipulation
   - Test if is_superuser claim can be modified
   - Verify all privileged operations check authorization
   - Test for authorization bypass via parameter pollution

**MUST FIX ASAP if found:**
- Missing authorization checks
- Inconsistent role enforcement
- IDOR vulnerabilities
- Privilege escalation paths

---

### Phase 3: OWASP TOP 10 SECURITY TESTING

#### 1. Broken Access Control
**Tests:**
- Access admin pages without authentication
- Modify URLs to access other users' data
- Test forced browsing to restricted areas
- Verify CORS policy enforcement
- Test for missing function-level access control

#### 2. Cryptographic Failures
**Tests:**
- Check if passwords are hashed (bcrypt/argon2)
- Verify JWT secret strength
- Test for weak encryption algorithms
- Check for sensitive data in transit (HTTP vs HTTPS)
- Verify database encryption at rest

#### 3. Injection Attacks
**Tests:**
- SQL injection on all parameters
- XSS (stored, reflected, DOM-based)
- Command injection
- LDAP injection
- Template injection
- Server-side request forgery (SSRF)

#### 4. Insecure Design
**Tests:**
- Review architecture for security flaws
- Check for business logic vulnerabilities
- Test workflow abuse scenarios
- Verify defense in depth implementation

#### 5. Security Misconfiguration
**Tests:**
- Check for default credentials
- Review unnecessary features/endpoints
- Test error handling configuration
- Verify security headers (CSP, HSTS, X-Frame-Options)
- Check CORS configuration
- Review file permissions

#### 6. Vulnerable and Outdated Components
**Tests:**
- Scan npm dependencies for vulnerabilities
- Check Python packages for CVEs
- Verify all components are up-to-date
- Test for known exploits in used versions

#### 7. Identification and Authentication Failures
**Tests:**
- Test password complexity requirements
- Check for account enumeration
- Test brute force protection
- Verify session management
- Check for credential stuffing vulnerabilities
- Test multi-factor authentication (if implemented)

#### 8. Software and Data Integrity Failures
**Tests:**
- Review CI/CD pipeline security
- Check for unsigned packages/dependencies
- Test for deserialization vulnerabilities
- Verify update mechanisms

#### 9. Security Logging and Monitoring Failures
**Tests:**
- Verify critical events are logged
- Check if logs are protected
- Test for log injection
- Review monitoring and alerting setup

#### 10. Server-Side Request Forgery (SSRF)
**Tests:**
- Test external URL processing
- Attempt to access internal resources
- Check for blind SSRF vulnerabilities
- Test URL validation bypass

---

### Phase 4: BRUTE FORCE & STRESS TESTING

#### Authentication Brute Force
**Tools:** Hydra, Burp Intruder, Custom scripts

**Tests:**
1. Login Endpoint
   - Test rate limiting (5/min, 20/hour)
   - Attempt credential stuffing
   - Test account lockout mechanisms
   - Verify captcha implementation (if any)

2. Password Reset
   - Test for token predictability
   - Attempt token brute forcing
   - Check token expiration

3. API Key/Token Brute Force
   - Test JWT token guessing
   - Attempt session token prediction

#### Fuzzing
**Tools:** ffuf, wfuzz, Burp Intruder

**Tests:**
- Fuzz all API endpoints with random data
- Test file upload with malicious files
- Fuzz headers and cookies
- Test for hidden parameters

#### Load Testing
**Tools:** Apache Bench, k6, Locust

**Tests:**
- Simulate 1000 concurrent users
- Test database connection pool limits
- Verify graceful degradation under load
- Check for race conditions

---

### Phase 5: ADVANCED ATTACKS

#### 1. Race Conditions
- Test concurrent requests to sensitive operations
- Attempt double-spending scenarios
- Test for time-of-check/time-of-use (TOCTOU) bugs

#### 2. Business Logic Flaws
- Test workflow bypass (draft → published without approval)
- Attempt price/quantity manipulation
- Test for logic flaws in state transitions

#### 3. Client-Side Attacks
- Test for DOM-based XSS
- Check for exposed API keys in JavaScript
- Test for clickjacking vulnerabilities
- Verify Content Security Policy

#### 4. Supply Chain Attacks
- Review all third-party dependencies
- Check for typosquatting in packages
- Verify integrity of CDN resources
- Test for dependency confusion attacks

#### 5. API Security
- Test for API versioning issues
- Check for verbose error responses
- Test for GraphQL injection (if applicable)
- Verify API documentation doesn't leak sensitive info

---

### Phase 6: INFRASTRUCTURE & DEPLOYMENT SECURITY

#### Docker Security
**Tests:**
- Check for running containers as root
- Verify no secrets in Dockerfiles
- Test for container escape vulnerabilities
- Review exposed ports
- Check for outdated base images

#### Database Security
**Tests:**
- Check for default credentials
- Verify encryption at rest
- Test for SQL injection
- Review access controls
- Check for exposed database ports

#### CI/CD Pipeline Security
**Tests:**
- Review GitHub Actions secrets management
- Check for code injection in workflows
- Verify branch protection rules
- Test for pipeline privilege escalation

#### Server Configuration
**Tests:**
- Verify firewall rules
- Check for unnecessary open ports
- Test SSH configuration
- Review SSL/TLS configuration
- Verify security updates are applied

---

### Phase 7: CODE REVIEW CHECKLIST

#### Authentication & Authorization
- [ ] All admin endpoints require authentication
- [ ] JWT tokens have proper expiration
- [ ] Passwords are hashed with bcrypt (cost ≥ 12)
- [ ] Rate limiting on authentication endpoints
- [ ] No hardcoded credentials
- [ ] Session management is secure
- [ ] Authorization checks on every protected route

#### Input Validation
- [ ] All user input is validated
- [ ] Input validation on both client and server
- [ ] Parameterized queries prevent SQL injection
- [ ] XSS protection (output encoding)
- [ ] File upload validation (type, size, content)
- [ ] No eval() or exec() with user input
- [ ] JSON parsing is safe

#### Data Protection
- [ ] Sensitive data is encrypted at rest
- [ ] HTTPS enforced for all communication
- [ ] Secure cookie flags (HttpOnly, Secure, SameSite)
- [ ] No sensitive data in logs
- [ ] PII is properly protected
- [ ] Database backups are encrypted

#### Error Handling
- [ ] No verbose error messages in production
- [ ] Stack traces are not exposed
- [ ] Custom error pages for 404, 500, etc.
- [ ] Errors are logged securely

#### Security Headers
- [ ] Content-Security-Policy
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security
- [ ] X-XSS-Protection
- [ ] Referrer-Policy

#### Dependencies
- [ ] All dependencies are up-to-date
- [ ] No known vulnerabilities in dependencies
- [ ] Dependency pinning in package files
- [ ] Regular security audits (npm audit, pip audit)

---

## TESTING EXECUTION PLAN

### Day 1: Reconnaissance
- Map entire application
- Document all endpoints
- Identify technologies and versions
- Run automated vulnerability scanners

### Day 2: STRIDE Modeling
- Apply STRIDE to each component
- Document threats and attack vectors
- Prioritize high-risk areas

### Day 3-4: OWASP Testing
- Test for all OWASP Top 10 vulnerabilities
- Document findings with PoC
- Assign severity ratings

### Day 5: Brute Force & Fuzzing
- Conduct brute force attacks
- Perform comprehensive fuzzing
- Load testing and stress testing

### Day 6: Advanced Attacks
- Test race conditions
- Business logic testing
- Client-side security testing

### Day 7: Infrastructure & Code Review
- Review infrastructure security
- Code audit for security issues
- Final report preparation

---

## SEVERITY RATING SYSTEM

### CRITICAL (Must Fix Immediately - Within 24 hours)
- Remote code execution
- SQL injection leading to data breach
- Authentication bypass
- Privilege escalation to admin
- Exposed credentials or secrets

### HIGH (Must Fix ASAP - Within 1 week)
- XSS vulnerabilities
- CSRF in critical operations
- Missing authentication on admin endpoints
- Insecure direct object references
- Weak cryptography

### MEDIUM (Must Fix - Within 2 weeks)
- Information disclosure
- Missing security headers
- Insufficient rate limiting
- Weak password policy
- Verbose error messages

### LOW (Should Fix - Within 1 month)
- Security misconfigurations
- Missing best practices
- Code quality issues
- Documentation gaps

---

## TOOLS ARSENAL

### Automated Scanners
- **OWASP ZAP** - Web application security scanner
- **Burp Suite Professional** - Comprehensive testing platform
- **Nikto** - Web server scanner
- **SQLMap** - SQL injection testing
- **Nmap** - Network scanner
- **Trivy** - Container vulnerability scanner

### Manual Testing Tools
- **Postman/Insomnia** - API testing
- **curl** - HTTP requests
- **Browser DevTools** - Client-side testing
- **JWT.io** - Token analysis

### Code Analysis
- **Bandit** - Python security linter
- **ESLint Security Plugin** - JavaScript security
- **Snyk** - Dependency vulnerability scanning
- **npm audit / pip-audit** - Package auditing

### Fuzzing & Brute Force
- **ffuf** - Fast web fuzzer
- **Hydra** - Password brute forcing
- **Burp Intruder** - Custom payload testing

### Load Testing
- **Apache Bench** - HTTP load testing
- **k6** - Modern load testing
- **Locust** - Python-based load testing

---

## REPORTING TEMPLATE

### Executive Summary
- Overall security posture
- Critical findings count
- Risk score (1-10)
- Recommendations priority

### Detailed Findings
For each vulnerability:
1. **Title:** Clear description
2. **Severity:** Critical/High/Medium/Low
3. **CVSS Score:** If applicable
4. **Affected Component:** Specific file/endpoint
5. **Description:** What is the vulnerability
6. **Impact:** What can attacker achieve
7. **Proof of Concept:** Steps to reproduce
8. **Remediation:** How to fix (MUST FIX ASAP)
9. **References:** OWASP, CWE, CVE links

### Recommendations
- Prioritized list of fixes
- Long-term security improvements
- Process recommendations
- Training needs

---

## CONTINUOUS SECURITY

### Recommended Practices
1. **Security in CI/CD**
   - Automated SAST/DAST scanning
   - Dependency vulnerability scanning
   - Container scanning
   - Secret scanning

2. **Regular Audits**
   - Quarterly penetration testing
   - Monthly dependency updates
   - Weekly security reviews

3. **Monitoring & Response**
   - Real-time security monitoring
   - Incident response plan
   - Security logging and alerting

4. **Security Training**
   - Regular developer security training
   - Secure coding guidelines
   - Threat modeling workshops

---

## COMPLIANCE & STANDARDS

### Standards to Follow
- OWASP Application Security Verification Standard (ASVS)
- NIST Cybersecurity Framework
- CIS Controls
- PCI DSS (if handling payments)
- GDPR (for EU users)
- CCPA (for California users)

### Security Benchmarks
- CIS Docker Benchmark
- CIS PostgreSQL Benchmark
- CIS Nginx Benchmark

---

## FINAL CHECKLIST

Before declaring application "production-ready":

- [ ] All CRITICAL vulnerabilities fixed
- [ ] All HIGH vulnerabilities fixed or mitigated
- [ ] STRIDE threats documented and addressed
- [ ] OWASP Top 10 testing completed
- [ ] Penetration testing report reviewed
- [ ] Security headers implemented
- [ ] Rate limiting configured
- [ ] Audit logging enabled
- [ ] Incident response plan in place
- [ ] Security monitoring active
- [ ] Backup and recovery tested
- [ ] Dependencies updated and scanned
- [ ] Code review completed
- [ ] Security documentation updated
- [ ] Team trained on security practices

---

## ENGAGEMENT RULES

**As a Senior QA/Security Engineer, I approach this with:**

1. **Zero Trust Mindset** - Assume everything can be compromised
2. **Attacker Perspective** - Think like a malicious actor
3. **Comprehensive Coverage** - Test everything, miss nothing
4. **Evidence-Based** - Every finding has a PoC
5. **Actionable Results** - Clear remediation steps
6. **No Mercy** - Attackers won't show mercy, neither will I

**Remember:** One vulnerability is all an attacker needs. Our job is to find and fix them all before they do.

---

## AUTHORIZATION

This security audit is authorized for:
- **Target:** hendrixxD/MyPortfolio application
- **Scope:** All components (frontend, backend, infrastructure)
- **Methods:** All ethical hacking techniques
- **Duration:** Continuous assessment
- **Objective:** Ensure production-ready security posture

**Disclaimer:** This is an authorized security assessment of the application owner's system. All testing follows ethical hacking guidelines and responsible disclosure practices.
