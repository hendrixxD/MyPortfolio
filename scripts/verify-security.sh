#!/bin/bash
# Security Verification Script
# Run this before committing or deploying to verify no credentials are exposed

set -e

echo "🔒 Security Verification Started..."
echo ""

FAILED=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Verify .env files are ignored
echo "📋 Check 1: Verifying .env files are ignored..."
ENV_FILES=(".env" ".env.production" "backend/.env" "frontend/.env.local")
for file in "${ENV_FILES[@]}"; do
    if [ -f "$file" ]; then
        if git check-ignore -q "$file"; then
            echo -e "  ${GREEN}✓${NC} $file is properly ignored"
        else
            echo -e "  ${RED}✗${NC} $file is NOT ignored!"
            FAILED=1
        fi
    fi
done
echo ""

# Check 2: No .env files tracked in git
echo "📋 Check 2: Checking for tracked .env files..."
TRACKED_ENV=$(git ls-files | grep -E "\.env$|\.env\.local$|\.env\.production$" || true)
if [ -z "$TRACKED_ENV" ]; then
    echo -e "  ${GREEN}✓${NC} No .env files tracked in git"
else
    echo -e "  ${RED}✗${NC} Found tracked .env files:"
    echo "$TRACKED_ENV"
    FAILED=1
fi
echo ""

# Check 3: Search for hardcoded passwords
echo "📋 Check 3: Searching for hardcoded passwords..."
HARDCODED_PASS=$(grep -r "password.*=.*['\"]" \
    --include="*.py" --include="*.js" --include="*.ts" --include="*.tsx" \
    --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=venv --exclude-dir=__pycache__ \
    . 2>/dev/null | grep -v "# " | grep -v "//" | grep -v "label.*password" | grep -v "placeholder.*password" || true)

if [ -z "$HARDCODED_PASS" ]; then
    echo -e "  ${GREEN}✓${NC} No hardcoded passwords found"
else
    echo -e "  ${YELLOW}⚠${NC} Potential hardcoded passwords found (review manually):"
    echo "$HARDCODED_PASS" | head -5
fi
echo ""

# Check 4: Search for API keys
echo "📋 Check 4: Searching for hardcoded API keys..."
HARDCODED_KEYS=$(grep -r "api[_-]key.*=.*['\"]" \
    --include="*.py" --include="*.js" --include="*.ts" \
    --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=venv \
    . 2>/dev/null | grep -v "# " | grep -v "//" || true)

if [ -z "$HARDCODED_KEYS" ]; then
    echo -e "  ${GREEN}✓${NC} No hardcoded API keys found"
else
    echo -e "  ${RED}✗${NC} Hardcoded API keys found:"
    echo "$HARDCODED_KEYS"
    FAILED=1
fi
echo ""

# Check 5: Search for connection strings with credentials
echo "📋 Check 5: Checking for connection strings with embedded credentials..."
CONN_STRINGS=$(grep -rE "(postgres|mysql|mongodb)://[^/]*:[^@]*@" \
    --include="*.py" --include="*.js" --include="*.ts" \
    --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=venv \
    . 2>/dev/null | grep -v "example" | grep -v "f\"" | grep -v "f'" || true)

if [ -z "$CONN_STRINGS" ]; then
    echo -e "  ${GREEN}✓${NC} No hardcoded connection strings found"
else
    echo -e "  ${YELLOW}⚠${NC} Connection strings found (verify they use env vars):"
    echo "$CONN_STRINGS"
fi
echo ""

# Check 6: Verify .env.production.example exists
echo "📋 Check 6: Verifying .env.production.example exists..."
if [ -f ".env.production.example" ]; then
    echo -e "  ${GREEN}✓${NC} .env.production.example exists"

    # Verify it only contains placeholders
    if grep -q "CHANGE_ME_" ".env.production.example"; then
        echo -e "  ${GREEN}✓${NC} Contains placeholder values"
    else
        echo -e "  ${YELLOW}⚠${NC} No CHANGE_ME_ placeholders found"
    fi
else
    echo -e "  ${RED}✗${NC} .env.production.example missing!"
    FAILED=1
fi
echo ""

# Check 7: Verify SECURITY.md exists
echo "📋 Check 7: Verifying SECURITY.md exists..."
if [ -f "SECURITY.md" ]; then
    echo -e "  ${GREEN}✓${NC} SECURITY.md exists"
else
    echo -e "  ${YELLOW}⚠${NC} SECURITY.md missing"
fi
echo ""

# Check 8: Check git history for .env files
echo "📋 Check 8: Checking git history for .env files..."
ENV_IN_HISTORY=$(git log --all --oneline --decorate -- ".env" "backend/.env" ".env.production" | head -5 || true)
if [ -z "$ENV_IN_HISTORY" ]; then
    echo -e "  ${GREEN}✓${NC} No .env files in git history"
else
    echo -e "  ${YELLOW}⚠${NC} .env files found in git history (check if they contained secrets):"
    echo "$ENV_IN_HISTORY"
fi
echo ""

# Final summary
echo "═══════════════════════════════════════"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Security verification PASSED${NC}"
    echo "Safe to commit and deploy"
    exit 0
else
    echo -e "${RED}✗ Security verification FAILED${NC}"
    echo "Fix the issues above before committing"
    exit 1
fi
