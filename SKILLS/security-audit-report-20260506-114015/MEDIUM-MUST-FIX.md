# MEDIUM PRIORITY VULNERABILITIES - MUST FIX

## .git directory present (verify web server blocks access)
**Affected Component:** `.git/`

**Description:**
.git directory exists and could be exposed if web server is misconfigured.

**Impact:**
Attackers could clone the repository and access full source code history including deleted secrets.

**Remediation (MUST FIX ASAP):**
Configure Nginx/Apache to deny access to .git directory. Add 'location ~ /\.git { deny all; }' to web server config.

---

## Backup files found that could expose source code
**Affected Component:** `Various locations`

**Description:**
Backup files (.bak, .old, .swp) found in codebase.

**Impact:**
These files may contain old code with vulnerabilities or exposed secrets.

**Remediation (MUST FIX ASAP):**
Remove all backup files from repository. Add to .gitignore: *.bak, *.old, *.swp, *~

---
