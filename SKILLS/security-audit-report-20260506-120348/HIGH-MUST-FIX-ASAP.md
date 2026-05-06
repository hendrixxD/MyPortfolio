# HIGH PRIORITY VULNERABILITIES - MUST FIX ASAP (Within 1 Week)

These vulnerabilities pose significant security risks.

---


## Environment File in Backend Directory

**Severity:** HIGH
**Component:** `backend/.env`

**Description:**
.env file found in backend directory.

**Impact:**
If web server is misconfigured, .env could be publicly accessible.

**Remediation (MUST FIX ASAP):**
Ensure .env is in .gitignore. Configure web server to deny access to dotfiles.

---


## Weak Example Secret Key

**Severity:** HIGH
**Component:** `backend/.env.example`

**Description:**
.env.example contains weak example secret key that users might copy.

**Impact:**
Users may use weak secret key, allowing JWT token forgery.

**Remediation (MUST FIX ASAP):**
Add strong example key generation instruction. Validate key strength on startup.

---


## Docker Container Runs as Root

**Severity:** HIGH
**Component:** `backend/Dockerfile`

**Description:**
Dockerfile doesn't specify USER directive.

**Impact:**
Container escape vulnerabilities lead to root access on host.

**Remediation (MUST FIX ASAP):**
Add non-root user: RUN adduser --disabled-password appuser && USER appuser

---

