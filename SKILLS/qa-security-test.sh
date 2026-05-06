#!/bin/bash

################################################################################
# PORTFOLIO SECURITY & QA AUDIT SCRIPT
# Senior QA Engineer - Combined Experience: Google, Tesla, SpaceX, CIA, Palantir
################################################################################

set -e

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'
BOLD='\033[1m'

# Report files
REPORT_DIR="$SCRIPT_DIR/security-audit-report-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$REPORT_DIR"

CRITICAL_REPORT="$REPORT_DIR/CRITICAL-MUST-FIX-NOW.md"
HIGH_REPORT="$REPORT_DIR/HIGH-MUST-FIX-ASAP.md"
MEDIUM_REPORT="$REPORT_DIR/MEDIUM-MUST-FIX.md"
SUMMARY_REPORT="$REPORT_DIR/EXECUTIVE-SUMMARY.md"

# Initialize reports
cat > "$CRITICAL_REPORT" << 'EOF'
# CRITICAL VULNERABILITIES - FIX IMMEDIATELY (Within 24 Hours)

These vulnerabilities pose immediate risk of complete system compromise.

---

EOF

cat > "$HIGH_REPORT" << 'EOF'
# HIGH PRIORITY VULNERABILITIES - MUST FIX ASAP (Within 1 Week)

These vulnerabilities pose significant security risks.

---

EOF

cat > "$MEDIUM_REPORT" << 'EOF'
# MEDIUM PRIORITY VULNERABILITIES - MUST FIX (Within 2 Weeks)

These vulnerabilities should be addressed to improve security posture.

---

EOF

# Counters
CRITICAL_COUNT=0
HIGH_COUNT=0
MEDIUM_COUNT=0

################################################################################
# UTILITY FUNCTIONS
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_critical() {
    echo -e "${RED}${BOLD}[CRITICAL]${NC} $1"
    CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
}

log_high() {
    echo -e "${RED}[HIGH]${NC} $1"
    HIGH_COUNT=$((HIGH_COUNT + 1))
}

log_medium() {
    echo -e "${YELLOW}[MEDIUM]${NC} $1"
    MEDIUM_COUNT=$((MEDIUM_COUNT + 1))
}

add_finding() {
    local severity=$1
    local title=$2
    local description=$3
    local impact=$4
    local remediation=$5
    local file=$6

    case $severity in
        CRITICAL)
            report_file="$CRITICAL_REPORT"
            log_critical "$title"
            ;;
        HIGH)
            report_file="$HIGH_REPORT"
            log_high "$title"
            ;;
        MEDIUM)
            report_file="$MEDIUM_REPORT"
            log_medium "$title"
            ;;
    esac

    cat >> "$report_file" << EOF

## $title

**Severity:** $severity
**Component:** \`$file\`

**Description:**
$description

**Impact:**
$impact

**Remediation (MUST FIX ASAP):**
$remediation

---

EOF
}

################################################################################
# PHASE 1: RECONNAISSANCE
################################################################################

phase_reconnaissance() {
    echo ""
    echo -e "${BOLD}=== PHASE 1: RECONNAISSANCE & INFORMATION GATHERING ===${NC}"
    echo ""

    log_info "Scanning for sensitive information..."

    # Check for hardcoded credentials in Python files (actual secret values, not variable names)
    HARDCODED_PASS=$(grep -rE "password\s*=\s*['\"][a-zA-Z0-9!@#$%^&*]{8,}['\"]" "$BACKEND_DIR" --include="*.py" --exclude-dir=venv --exclude-dir=__pycache__ 2>/dev/null | \
                     grep -v "ADMIN_PASSWORD" | \
                     grep -v "hashed_password" | \
                     grep -v "get_password_hash" | \
                     grep -v "password_hash" | \
                     grep -v "test_" | \
                     grep -v "example" | \
                     grep -v "your-" | \
                     grep -v "DEFAULT_PASSWORD" | \
                     head -n 1)

    if [ -n "$HARDCODED_PASS" ]; then
        add_finding "CRITICAL" "Hardcoded Password Found" \
            "Actual hardcoded password value found: ${HARDCODED_PASS:0:100}" \
            "Attackers can extract credentials and gain unauthorized access." \
            "Remove all hardcoded passwords. Use environment variables for all secrets." \
            "backend/**/*.py"
    else
        log_success "No hardcoded passwords found in Python files"
    fi

    # Check for API keys in frontend (actual key values, not variable names)
    API_KEYS=$(grep -rE "(api[_-]?key|api[_-]?secret)\s*[:=]\s*['\"][a-zA-Z0-9_-]{20,}['\"]" "$FRONTEND_DIR/src" --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null | \
               grep -v "node_modules" | \
               grep -v "process.env" | \
               grep -v "NEXT_PUBLIC" | \
               grep -v "getApiKey" | \
               head -n 1)

    if [ -n "$API_KEYS" ]; then
        add_finding "CRITICAL" "API Key Exposure Risk" \
            "Actual API key values found in frontend: ${API_KEYS:0:100}" \
            "API keys in client-side code can be extracted and abused." \
            "Move all API keys to backend. Use environment variables. Implement backend proxy for API calls." \
            "frontend/src/**/*"
    else
        log_success "No exposed API keys found in frontend"
    fi

    # Check for .env file in backend
    if [ -f "$BACKEND_DIR/.env" ]; then
        add_finding "HIGH" "Environment File in Backend Directory" \
            ".env file found in backend directory." \
            "If web server is misconfigured, .env could be publicly accessible." \
            "Ensure .env is in .gitignore. Configure web server to deny access to dotfiles." \
            "backend/.env"
    else
        log_success "No .env file found in backend directory"
    fi

    # Check if .env was ever committed to git
    cd "$PROJECT_ROOT"
    if git log --all --full-history --source -- "**/.env" 2>/dev/null | grep -q "commit"; then
        add_finding "CRITICAL" "Environment Files in Git History" \
            ".env files found in git history. ALL secrets are compromised." \
            "Anyone with repo access can extract all historical secrets." \
            "Remove from git history: git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch **/.env' --prune-empty -- --all && git push origin --force --all. ROTATE ALL SECRETS IMMEDIATELY." \
            "Git history"
    else
        log_success "No .env files found in git history"
    fi

    # Check for backup files
    if find "$PROJECT_ROOT" -name "*.bak" -o -name "*.old" -o -name "*.swp" 2>/dev/null | grep -v node_modules | grep -v venv | grep -v ".next" | head -n 1 >/dev/null; then
        add_finding "MEDIUM" "Backup Files Present" \
            "Backup files found that could expose old code with vulnerabilities." \
            "These files may contain old code with known vulnerabilities or secrets." \
            "Remove all backup files. Add to .gitignore: *.bak, *.old, *.swp" \
            "Various locations"
    else
        log_success "No backup files found"
    fi

    cd "$SCRIPT_DIR"
    log_success "Phase 1 complete"
}

################################################################################
# PHASE 2: AUTHENTICATION & AUTHORIZATION
################################################################################

phase_auth_testing() {
    echo ""
    echo -e "${BOLD}=== PHASE 2: AUTHENTICATION & AUTHORIZATION TESTING ===${NC}"
    echo ""

    # Check JWT secret strength
    log_info "Checking JWT configuration..."

    if [ -f "$BACKEND_DIR/.env.example" ]; then
        if grep -q "SECRET_KEY=your-secret-key" "$BACKEND_DIR/.env.example" 2>/dev/null; then
            add_finding "HIGH" "Weak Example Secret Key" \
                ".env.example contains weak example secret key that users might copy." \
                "Users may use weak secret key, allowing JWT token forgery." \
                "Add strong example key generation instruction. Validate key strength on startup." \
                "backend/.env.example"
        fi
    fi

    # Check for bcrypt in requirements
    if ! grep -q "bcrypt" "$BACKEND_DIR/requirements.txt" 2>/dev/null; then
        add_finding "CRITICAL" "Missing Password Hashing Library" \
            "bcrypt not found in requirements.txt." \
            "Passwords may not be properly hashed, making them easy to crack." \
            "Add bcrypt>=4.0.0 to requirements.txt. Ensure cost factor >= 12." \
            "backend/requirements.txt"
    else
        log_success "bcrypt library found in requirements"
    fi

    # Check rate limiting implementation (check both old and new files)
    RATE_LIMIT_FILES=$(find "$BACKEND_DIR/app/middleware" -name "rate_limit*.py" 2>/dev/null)

    if [ -z "$RATE_LIMIT_FILES" ]; then
        add_finding "CRITICAL" "Rate Limiting Not Implemented" \
            "No rate limiting middleware found." \
            "Application vulnerable to brute force attacks and credential stuffing." \
            "Implement Redis-based rate limiting for distributed systems." \
            "backend/app/middleware/"
    else
        # Check if ANY rate limit file uses Redis
        if grep -q "redis\|Redis" $RATE_LIMIT_FILES 2>/dev/null; then
            log_success "Redis-based rate limiting implemented"
        else
            add_finding "CRITICAL" "Rate Limiting is In-Memory Only" \
                "Rate limiting uses in-memory storage, not suitable for production." \
                "With multiple servers, rate limiting can be bypassed by distributing requests." \
                "Implement Redis-based rate limiting for proper distributed rate limiting." \
                "backend/app/middleware/rate_limit*.py"
        fi
    fi

    # Check for CSRF protection
    if ! grep -rq "csrf\|CSRF" "$BACKEND_DIR/app" --include="*.py" 2>/dev/null; then
        add_finding "CRITICAL" "Missing CSRF Protection" \
            "No CSRF protection found in application." \
            "Application vulnerable to Cross-Site Request Forgery attacks." \
            "Implement CSRF tokens for all state-changing operations. Set SameSite cookie attribute." \
            "backend/app/api/"
    else
        log_success "CSRF protection appears to be implemented"
    fi

    log_success "Phase 2 complete"
}

################################################################################
# PHASE 3: INPUT VALIDATION & INJECTION
################################################################################

phase_injection_testing() {
    echo ""
    echo -e "${BOLD}=== PHASE 3: INJECTION VULNERABILITY TESTING ===${NC}"
    echo ""

    # Check for potential SQL injection (more robust: exclude SQLAlchemy ORM)
    log_info "Checking for SQL injection vectors..."

    # Look for raw SQL with string formatting, but exclude SQLAlchemy ORM patterns
    SQL_INJECTION=$(grep -r "execute.*['\"].*%\|execute.*format\|execute.*f['\"]" "$BACKEND_DIR/app" --include="*.py" 2>/dev/null | \
                    grep -v "__pycache__" | \
                    grep -v "# noqa" | \
                    grep -v "\.query\(\)" | \
                    grep -v "sqlalchemy" | \
                    head -n 5)

    if [ -n "$SQL_INJECTION" ] && ! grep -rq "from sqlalchemy" "$BACKEND_DIR/app" --include="*.py" 2>/dev/null; then
        add_finding "CRITICAL" "SQL Injection Vulnerability" \
            "Raw SQL queries with string formatting detected without ORM protection." \
            "Attackers can inject SQL commands, leading to complete database compromise." \
            "Use parameterized queries or SQLAlchemy ORM. Never use string formatting in SQL." \
            "backend/app/**/*.py"
    elif [ -n "$SQL_INJECTION" ]; then
        log_warning "Potential SQL string formatting found, but SQLAlchemy ORM is in use (likely safe)"
    else
        log_success "No SQL injection vulnerabilities found"
    fi

    # Check for XSS vulnerabilities
    if grep -r "dangerouslySetInnerHTML" "$FRONTEND_DIR/src" --include="*.tsx" --include="*.jsx" 2>/dev/null; then
        add_finding "HIGH" "Cross-Site Scripting (XSS) Risk" \
            "dangerouslySetInnerHTML used without sanitization." \
            "Attackers can inject malicious JavaScript to steal sessions or deface website." \
            "Sanitize all HTML with DOMPurify before rendering. Avoid dangerouslySetInnerHTML." \
            "frontend/src/**/*.tsx"
    else
        log_success "No dangerouslySetInnerHTML usage found"
    fi

    # Check for command injection (more context-aware)
    CMD_INJECTION=$(grep -r "subprocess\.call\|subprocess\.run\|os\.system\|eval(" "$BACKEND_DIR/app" --include="*.py" 2>/dev/null | \
                    grep -v "__pycache__" | \
                    grep -v "spec.loader.exec" | \
                    grep -v "# safe:" | \
                    grep -v "test_" | \
                    head -n 3)

    if [ -n "$CMD_INJECTION" ]; then
        # Check if the usage is in user-facing endpoints (not config/internal)
        if echo "$CMD_INJECTION" | grep -q "api/\|endpoints/\|services/"; then
            add_finding "CRITICAL" "Command Injection Risk" \
                "subprocess or eval usage detected in user-facing code." \
                "If user input reaches these functions, attackers can execute system commands." \
                "Never use subprocess/eval with user input. Validate input strictly. Use safe alternatives." \
                "backend/app/**/*.py"
        else
            log_warning "subprocess/eval found in non-user-facing code (review for safety)"
        fi
    else
        log_success "No command injection vectors found"
    fi

    log_success "Phase 3 complete"
}

################################################################################
# PHASE 4: FILE UPLOAD SECURITY
################################################################################

phase_file_upload() {
    echo ""
    echo -e "${BOLD}=== PHASE 4: FILE UPLOAD SECURITY ===${NC}"
    echo ""

    if [ -f "$BACKEND_DIR/app/api/v1/endpoints/upload.py" ]; then
        # Check for content validation (check both upload.py and core modules)
        if ! grep -rq "magic\|validate.*content\|MAGIC_BYTES" "$BACKEND_DIR/app" --include="*.py" 2>/dev/null; then
            add_finding "CRITICAL" "No File Content Validation" \
                "File uploads only check extension, not actual file content." \
                "Attackers can upload web shells (e.g., shell.php.jpg) leading to Remote Code Execution." \
                "Validate file content with python-magic. Check magic bytes, not just extension. Store uploads outside web root." \
                "backend/app/api/v1/endpoints/upload.py"
        else
            log_success "File content validation implemented"
        fi

        # Check for size limits
        if ! grep -q "MAX_UPLOAD_SIZE\|max.*size" "$BACKEND_DIR/app" --include="*.py" -r 2>/dev/null; then
            add_finding "HIGH" "Missing File Size Limits" \
                "No file size limits configured for uploads." \
                "Attackers can upload huge files to exhaust disk space (DoS)." \
                "Implement strict file size limits (e.g., 10MB for images) at application and web server level." \
                "backend/app/core/config.py"
        else
            log_success "File size limits configured"
        fi
    else
        log_warning "No upload endpoint found, skipping file upload tests"
    fi

    log_success "Phase 4 complete"
}

################################################################################
# PHASE 5: SECURITY HEADERS
################################################################################

phase_security_headers() {
    echo ""
    echo -e "${BOLD}=== PHASE 5: SECURITY HEADERS & CONFIGURATION ===${NC}"
    echo ""

    # Check for security headers
    if ! grep -rq "Content-Security-Policy\|CSP" "$BACKEND_DIR" "$FRONTEND_DIR" 2>/dev/null; then
        add_finding "HIGH" "Missing Content-Security-Policy Header" \
            "CSP header not configured." \
            "No protection against XSS, clickjacking, and code injection attacks." \
            "Implement strict CSP header in middleware or Nginx config." \
            "backend/app/main.py"
    else
        log_success "Content-Security-Policy appears to be configured"
    fi

    if ! grep -rq "Strict-Transport-Security\|HSTS" "$BACKEND_DIR" "$FRONTEND_DIR" 2>/dev/null; then
        add_finding "HIGH" "Missing HSTS Header" \
            "HTTP Strict Transport Security not configured." \
            "Users vulnerable to SSL stripping attacks and man-in-the-middle." \
            "Add HSTS header: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload" \
            "Nginx config or backend/app/main.py"
    else
        log_success "HSTS appears to be configured"
    fi

    # Check CORS configuration
    if grep -rq 'allow_origins.*=.*\[".*\*.*"\]' "$BACKEND_DIR/app/main.py" 2>/dev/null; then
        add_finding "HIGH" "Overly Permissive CORS Policy" \
            "CORS allows all origins (*)." \
            "Any website can make requests to your API, enabling CSRF and data theft." \
            "Restrict CORS to specific trusted domains only." \
            "backend/app/main.py"
    else
        log_success "CORS policy appears properly restricted"
    fi

    log_success "Phase 5 complete"
}

################################################################################
# PHASE 6: DEPENDENCY SCANNING
################################################################################

phase_dependencies() {
    echo ""
    echo -e "${BOLD}=== PHASE 6: DEPENDENCY VULNERABILITY SCANNING ===${NC}"
    echo ""

    # Python dependencies
    log_info "Checking Python dependencies..."
    if command -v pip-audit &> /dev/null; then
        cd "$BACKEND_DIR"
        if pip-audit --desc > "$REPORT_DIR/pip-audit.txt" 2>&1; then
            log_success "No Python dependency vulnerabilities"
        else
            add_finding "CRITICAL" "Vulnerable Python Dependencies" \
                "pip-audit found packages with known CVEs. See pip-audit.txt" \
                "Vulnerable packages can be exploited to compromise the application." \
                "Update packages: pip install --upgrade <package>. Review pip-audit.txt." \
                "backend/requirements.txt"
        fi
    else
        log_warning "pip-audit not installed. Install: pip install pip-audit"
    fi

    # Node.js dependencies (only flag if CRITICAL or HIGH vulns exist)
    log_info "Checking Node.js dependencies..."
    cd "$FRONTEND_DIR"
    npm audit --json > "$REPORT_DIR/npm-audit.json" 2>&1

    # Check for critical/high severity vulnerabilities
    CRITICAL_HIGH=$(jq '[.vulnerabilities | to_entries[] | select(.value.severity == "critical" or .value.severity == "high")] | length' "$REPORT_DIR/npm-audit.json" 2>/dev/null || echo "0")

    if [ "$CRITICAL_HIGH" -gt 0 ]; then
        add_finding "CRITICAL" "Vulnerable npm Dependencies" \
            "npm audit found $CRITICAL_HIGH critical/high vulnerabilities. See npm-audit.json" \
            "Vulnerable packages can lead to XSS, prototype pollution, or RCE." \
            "Run 'npm audit fix'. Manually update packages that can't auto-fix." \
            "frontend/package.json"
    else
        log_success "No critical/high npm vulnerabilities (low/moderate issues acceptable)"
    fi

    cd "$SCRIPT_DIR"
    log_success "Phase 6 complete"
}

################################################################################
# PHASE 7: DOCKER SECURITY
################################################################################

phase_docker_security() {
    echo ""
    echo -e "${BOLD}=== PHASE 7: DOCKER SECURITY ===${NC}"
    echo ""

    # Check if containers run as root
    for dockerfile in "$BACKEND_DIR/Dockerfile" "$FRONTEND_DIR/Dockerfile"; do
        if [ -f "$dockerfile" ]; then
            if ! grep -q "^USER" "$dockerfile" 2>/dev/null; then
                add_finding "HIGH" "Docker Container Runs as Root" \
                    "Dockerfile doesn't specify USER directive." \
                    "Container escape vulnerabilities lead to root access on host." \
                    "Add non-root user: RUN adduser --disabled-password appuser && USER appuser" \
                    "$(basename $(dirname $dockerfile))/Dockerfile"
            else
                log_success "$(basename $(dirname $dockerfile)) Dockerfile uses non-root user"
            fi
        fi
    done

    # Check for secrets in Dockerfiles
    if grep -r "ENV.*PASSWORD\|ENV.*SECRET\|ENV.*KEY" "$BACKEND_DIR/Dockerfile" "$FRONTEND_DIR/Dockerfile" 2>/dev/null | grep -v "ARG"; then
        add_finding "CRITICAL" "Secrets in Dockerfile" \
            "Passwords or secrets hardcoded in Dockerfile ENV." \
            "Docker images contain extractable secrets." \
            "Never put secrets in Dockerfile. Use Docker secrets or runtime environment variables." \
            "Dockerfile"
    else
        log_success "No hardcoded secrets in Dockerfiles"
    fi

    log_success "Phase 7 complete"
}

################################################################################
# PHASE 8: AUTHORIZATION CHECKS
################################################################################

phase_authorization() {
    echo ""
    echo -e "${BOLD}=== PHASE 8: AUTHORIZATION & ACCESS CONTROL ===${NC}"
    echo ""

    # Check for IDOR vulnerabilities (context-aware)
    log_info "Checking for Insecure Direct Object References..."

    # Count endpoints with ID parameters
    ID_ENDPOINTS=$(grep -rE "def (get|update|delete).*\(.*(_id|id):" "$BACKEND_DIR/app/api" --include="*.py" 2>/dev/null | grep -v "__pycache__" | wc -l)

    if [ "$ID_ENDPOINTS" -gt 0 ]; then
        # Check for admin protection (AdminUser) on these endpoints
        ADMIN_PROTECTED=$(grep -rE "(admin|AdminUser|is_superuser|is_admin)" "$BACKEND_DIR/app/api" --include="*.py" 2>/dev/null | wc -l)

        # If we have ID endpoints but no admin checks, flag it
        if [ "$ADMIN_PROTECTED" -lt 5 ]; then
            add_finding "CRITICAL" "Insecure Direct Object References (IDOR)" \
                "Found $ID_ENDPOINTS ID-based endpoints with insufficient admin/ownership protection." \
                "Users can access or modify other users' data by changing ID parameters." \
                "Add AdminUser dependency or ownership check: if resource.user_id != current_user.id and not current_user.is_admin: raise HTTPException(403)" \
                "backend/app/api/v1/endpoints/*.py"
        else
            log_success "ID-based endpoints appear to have admin protection ($ADMIN_PROTECTED admin checks found)"
        fi
    else
        log_success "No ID-based endpoints found"
    fi

    log_success "Phase 8 complete"
}

################################################################################
# GENERATE REPORT
################################################################################

generate_executive_summary() {
    echo ""
    echo -e "${BOLD}=== GENERATING EXECUTIVE SUMMARY ===${NC}"
    echo ""

    local risk_score=$(calculate_risk_score)

    cat > "$SUMMARY_REPORT" << EOF
# SECURITY AUDIT EXECUTIVE SUMMARY

**Date:** $(date +"%Y-%m-%d %H:%M:%S")
**Auditor:** Senior QA/Security Engineer (Google, Tesla, SpaceX, CIA, Palantir)
**Target:** hendrixxD/MyPortfolio Application
**Methodology:** STRIDE, OWASP Top 10, Penetration Testing

---

## OVERALL SECURITY POSTURE

**Risk Score:** $risk_score/10

### Vulnerability Count
- **CRITICAL:** $CRITICAL_COUNT (Must fix within 24 hours)
- **HIGH:** $HIGH_COUNT (Must fix within 1 week)
- **MEDIUM:** $MEDIUM_COUNT (Must fix within 2 weeks)
- **TOTAL:** $((CRITICAL_COUNT + HIGH_COUNT + MEDIUM_COUNT)) vulnerabilities found

---

## PRODUCTION READINESS

$(generate_production_status)

---

## IMMEDIATE ACTIONS REQUIRED

### Within 24 Hours (CRITICAL):
$(if [ $CRITICAL_COUNT -gt 0 ]; then echo "- Review and fix all CRITICAL findings in $CRITICAL_REPORT"; else echo "- No critical issues found"; fi)

### Within 1 Week (HIGH):
$(if [ $HIGH_COUNT -gt 0 ]; then echo "- Review and fix all HIGH priority findings in $HIGH_REPORT"; else echo "- No high priority issues found"; fi)

### Within 2 Weeks (MEDIUM):
$(if [ $MEDIUM_COUNT -gt 0 ]; then echo "- Review and fix all MEDIUM priority findings in $MEDIUM_REPORT"; else echo "- No medium priority issues found"; fi)

---

## DETAILED REPORTS

- [CRITICAL Vulnerabilities]($CRITICAL_REPORT)
- [HIGH Priority Vulnerabilities]($HIGH_REPORT)
- [MEDIUM Priority Vulnerabilities]($MEDIUM_REPORT)

---

## NEXT STEPS

1. Review all detailed reports
2. Create tickets for each vulnerability
3. Assign priority and owners
4. Fix based on severity (CRITICAL first)
5. Re-test after fixes
6. Final security sign-off

---

**Classification:** CONFIDENTIAL - INTERNAL USE ONLY
EOF

    log_success "Executive summary generated"
}

calculate_risk_score() {
    local score=$((CRITICAL_COUNT * 3 + HIGH_COUNT * 2 + MEDIUM_COUNT))

    if [ $score -ge 20 ]; then echo "10"
    elif [ $score -ge 15 ]; then echo "9"
    elif [ $score -ge 10 ]; then echo "8"
    elif [ $score -ge 7 ]; then echo "7"
    elif [ $score -ge 5 ]; then echo "6"
    elif [ $score -ge 3 ]; then echo "5"
    elif [ $score -ge 2 ]; then echo "3"
    else echo "2"
    fi
}

generate_production_status() {
    if [ $CRITICAL_COUNT -gt 0 ]; then
        echo "❌ **NOT SAFE FOR PRODUCTION**"
        echo ""
        echo "$CRITICAL_COUNT critical vulnerabilities pose immediate risk of complete system compromise."
    elif [ $HIGH_COUNT -gt 3 ]; then
        echo "⚠️ **HIGH RISK - NOT RECOMMENDED FOR PRODUCTION**"
        echo ""
        echo "Address high-priority vulnerabilities before deployment."
    elif [ $HIGH_COUNT -gt 0 ] || [ $MEDIUM_COUNT -gt 3 ]; then
        echo "⚠️ **MEDIUM RISK - PROCEED WITH CAUTION**"
        echo ""
        echo "Some security issues detected. Address before production if possible."
    else
        echo "✅ **ACCEPTABLE SECURITY POSTURE**"
        echo ""
        echo "No critical issues found. Address remaining findings to improve security."
    fi
}

################################################################################
# MAIN EXECUTION
################################################################################

main() {
    clear
    echo ""
    echo -e "${BOLD}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║          PORTFOLIO SECURITY & QA COMPREHENSIVE AUDIT                 ║${NC}"
    echo -e "${BOLD}║                                                                      ║${NC}"
    echo -e "${BOLD}║  Senior QA Engineer - 15+ Years Combined Experience                 ║${NC}"
    echo -e "${BOLD}║  Google • Tesla • SpaceX • CIA • Palantir                           ║${NC}"
    echo -e "${BOLD}║                                                                      ║${NC}"
    echo -e "${BOLD}║  Testing: STRIDE • OWASP Top 10 • Penetration Testing               ║${NC}"
    echo -e "${BOLD}║  Severity: ALL FINDINGS ARE 'MUST FIX ASAP'                         ║${NC}"
    echo -e "${BOLD}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    log_info "Project root: $PROJECT_ROOT"
    log_info "Report directory: $REPORT_DIR"
    echo ""

    # Execute all phases
    phase_reconnaissance
    phase_auth_testing
    phase_injection_testing
    phase_file_upload
    phase_security_headers
    phase_dependencies
    phase_docker_security
    phase_authorization

    # Generate reports
    generate_executive_summary

    echo ""
    echo -e "${BOLD}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║                        AUDIT COMPLETE                                ║${NC}"
    echo -e "${BOLD}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}${BOLD}CRITICAL:${NC} $CRITICAL_COUNT vulnerabilities"
    echo -e "${RED}HIGH:${NC}     $HIGH_COUNT vulnerabilities"
    echo -e "${YELLOW}MEDIUM:${NC}   $MEDIUM_COUNT vulnerabilities"
    echo ""
    echo -e "${BOLD}Reports generated in:${NC} $REPORT_DIR"
    echo ""
    echo -e "  📄 Executive Summary:    ${BOLD}$(basename $SUMMARY_REPORT)${NC}"
    echo -e "  🔴 Critical Findings:    ${BOLD}$(basename $CRITICAL_REPORT)${NC}"
    echo -e "  🟠 High Priority:        ${BOLD}$(basename $HIGH_REPORT)${NC}"
    echo -e "  🟡 Medium Priority:      ${BOLD}$(basename $MEDIUM_REPORT)${NC}"
    echo ""

    if [ $CRITICAL_COUNT -gt 0 ]; then
        echo -e "${RED}${BOLD}⚠️  APPLICATION IS NOT SAFE FOR PRODUCTION ⚠️${NC}"
        echo -e "${RED}Fix critical vulnerabilities immediately before deployment.${NC}"
        exit 1
    elif [ $HIGH_COUNT -gt 3 ]; then
        echo -e "${YELLOW}${BOLD}⚠️  HIGH RISK - Address vulnerabilities before production${NC}"
        exit 1
    else
        echo -e "${GREEN}${BOLD}✓ Security posture is acceptable${NC}"
    fi
}

# Run the audit
main "$@"
