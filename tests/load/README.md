# Load Testing Suite

Comprehensive load testing infrastructure for the portfolio application.

## Overview

This test suite validates system performance under stress, including:

1. **Database Connection Pool Stress** - 50+ concurrent users
2. **Rate Limiting Enforcement** - IP and account-based limiting
3. **Image Upload Load** - Concurrent R2 uploads with PIL processing
4. **API Latency Monitoring** - p50, p95, p99 tracking

## Prerequisites

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

Required packages:
- `locust` - Load testing framework
- `aiohttp` - Async HTTP client
- `Pillow` - Image processing
- `requests` - HTTP client

### 2. Start Backend Server

```bash
cd ../../backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3. Verify Backend is Running

```bash
curl http://localhost:8000/api/v1/health
```

Expected response: `{"status": "healthy"}`

---

## Test Suite

### Test 1: Database Connection Pool Load Test

**File**: `locustfile.py`

**Purpose**: Stress test database with concurrent read operations.

**Run Interactive Mode** (with web UI):
```bash
locust -f locustfile.py --host=http://localhost:8000
```
Then open: http://localhost:8089

**Run Headless Mode** (recommended for CI/CD):
```bash
locust -f locustfile.py \
    --host=http://localhost:8000 \
    --users 50 \
    --spawn-rate 5 \
    --run-time 5m \
    --headless
```

**Parameters**:
- `--users 50`: Simulate 50 concurrent users
- `--spawn-rate 5`: Add 5 users per second
- `--run-time 5m`: Run for 5 minutes

**What's Tested**:
- `/api/v1/articles` list endpoint (most common)
- `/api/v1/articles/:slug` detail pages
- Filtered searches and pagination
- Database query performance under load

**Success Criteria**:
- ✅ P95 latency < 300ms
- ✅ Zero connection pool exhaustion errors
- ✅ No database timeouts
- ✅ Error rate < 0.1%

**Metrics Reported**:
- Request count and failure rate
- P50, P95, P99 latency
- Requests per second
- Connection pool errors

---

### Test 2: Rate Limiting Validation

**File**: `test_rate_limiting.sh`

**Purpose**: Validate rate limiting and account lockout mechanisms.

**Run**:
```bash
./test_rate_limiting.sh http://localhost:8000
```

**What's Tested**:

1. **Distributed Load Test** (100 requests over 60s)
   - Tests IP-based rate limiting
   - Validates throttling under sustained load

2. **Account Lockout** (5 failed attempts)
   - Tests account lockout after 5 failed login attempts
   - Validates 15-minute lockout duration

3. **IP Rate Limiting** (30 rapid requests)
   - Tests rapid-fire requests from single IP
   - Validates 15 requests/minute threshold

**Success Criteria**:
- ✅ Rate limiter blocks excessive requests
- ✅ Account lockout triggers after 5 failures
- ✅ Legitimate requests not blocked
- ✅ Works with both Redis and in-memory fallback

**Metrics Reported**:
- Request counts by status code
- First block threshold
- Account lockout timing
- IP rate limiting effectiveness

---

### Test 3: Image Upload Load Test

**File**: `test_image_upload_load.py`

**Purpose**: Stress test R2 storage with concurrent uploads.

**Get Admin Token First**:
```bash
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login/json \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"yourpassword"}' \
    | jq -r '.access_token')
```

**Run**:
```bash
python test_image_upload_load.py http://localhost:8000 $TOKEN
```

**What's Tested**:
- 10 concurrent 10MB image uploads
- R2 upload success rate
- PIL image processing performance
- Backend responsiveness during I/O load

**Success Criteria**:
- ✅ Upload success rate ≥ 90%
- ✅ No R2 storage errors
- ✅ Average upload time < 30s for 10MB images
- ✅ PIL processing < 5s per image
- ✅ Backend remains responsive

**Metrics Reported**:
- Upload success/failure counts
- Upload time statistics (mean, median, min, max)
- PIL processing time
- R2 error counts
- Backend health check post-load

---

## Running the Full Test Suite

### Sequential Execution (Recommended)

```bash
#!/bin/bash
# run_all_tests.sh

echo "Starting full load test suite..."

# Test 1: Database load
echo "Test 1: Database Connection Pool Stress"
locust -f locustfile.py --host=http://localhost:8000 \
    --users 50 --spawn-rate 5 --run-time 5m --headless

sleep 30  # Cool down period

# Test 2: Rate limiting
echo "Test 2: Rate Limiting Validation"
./test_rate_limiting.sh http://localhost:8000

sleep 30  # Cool down period

# Test 3: Image uploads (requires admin token)
echo "Test 3: Image Upload Load Test"
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login/json \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"yourpassword"}' \
    | jq -r '.access_token')

python test_image_upload_load.py http://localhost:8000 $TOKEN

echo "Full test suite complete!"
```

### Expected Duration

- Test 1 (Database): 5 minutes
- Test 2 (Rate Limiting): 2-3 minutes
- Test 3 (Uploads): 1-2 minutes
- **Total**: ~10-15 minutes

---

## Understanding the Results

### Locust Output

```
Type     Name                          # reqs      # fails  |     Avg     Min     Max  Median  |   req/s  failures/s
--------|---------------------------|-------|-------------|-------|-------|-------|-------|-------|--------|-----------
GET      /api/v1/articles [LIST]     5000          0      |      85      12     420      80   |   16.67         0.00
GET      /api/v1/articles/:slug      2500          0      |     102      15     380      95   |    8.33         0.00
--------|---------------------------|-------|-------------|-------|-------|-------|-------|-------|--------|-----------
         Aggregated                  7500          0      |      91      12     420      85   |   25.00         0.00

DATABASE PERFORMANCE METRICS
============================================================
Total Queries: 7500
P50 Latency: 85.00ms
P95 Latency: 245.00ms
P99 Latency: 420.00ms
Connection Errors: 0
============================================================
✅ PASS: P95 latency (245.00ms) within SLA (300ms)
✅ PASS: No connection pool exhaustion
============================================================
```

### Rate Limiting Output

```
==========================================
TEST RESULTS
==========================================
Elapsed Time: 60s

Response Counts:
   ✅ Processed (401): 15
   ⏱️  Rate Limited (429): 75
   🔒 Account Locked (429): 10
   ❌ Errors: 0

==========================================
VALIDATION
==========================================
✅ PASS: Rate limiting is working
   - Blocked after 15 attempts
✅ PASS: Account lockout is working
   - 10 requests blocked by account lockout
✅ PASS: No unexpected errors
==========================================
```

### Image Upload Output

```
==========================================
TEST RESULTS
==========================================
Total Time: 45.23s

Upload Results:
   ✅ Successful: 10/10
   ❌ Failed: 0/10
   Success Rate: 100.0%

Upload Performance:
   Mean: 8.45s
   Median: 8.20s
   Min: 6.80s
   Max: 12.30s

PIL Processing Time:
   Mean: 2.15s
   Max: 2.80s

==========================================
VALIDATION
==========================================
✅ PASS: Upload success rate (100.0%) >= 90%
✅ PASS: No R2 storage errors
✅ PASS: Average upload time (8.45s) < 30s
✅ PASS: Backend responsive (0.15s)
==========================================
```

---

## Troubleshooting

### Issue: Connection Refused

**Symptom**: `ConnectionError: Connection refused`

**Solution**: Ensure backend is running
```bash
# Check if backend is running
curl http://localhost:8000/api/v1/health

# If not, start it
cd ../../backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Issue: High Failure Rate

**Symptom**: Locust shows >5% failures

**Possible Causes**:
1. Database connection pool exhausted
2. Database not running
3. Slow queries causing timeouts

**Debug**:
```bash
# Check database connections
psql -U postgres -d portfolio -c "SELECT count(*) FROM pg_stat_activity;"

# Check backend logs
tail -f ../../backend/logs/app.log

# Reduce concurrent users
locust -f locustfile.py --host=http://localhost:8000 \
    --users 10 --spawn-rate 1 --run-time 2m --headless
```

### Issue: Rate Limiting Not Working

**Symptom**: No 429 responses in rate limiting test

**Possible Causes**:
1. Rate limiter not configured
2. Redis not connected (should fall back to in-memory)
3. IP detection issues

**Debug**:
```bash
# Check backend logs for rate limiter status
grep -i "rate" ../../backend/logs/app.log

# Try with explicit IP
curl -X POST http://localhost:8000/api/v1/auth/login/json \
    -H "X-Forwarded-For: 203.0.113.1" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
```

### Issue: Image Upload 401 Unauthorized

**Symptom**: All uploads fail with 401

**Solution**: Get valid admin token
```bash
# Login and get token
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login/json \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"correct_password"}' \
    | jq -r '.access_token')

# Verify token works
curl -H "Authorization: Bearer $TOKEN" \
    http://localhost:8000/api/v1/auth/me
```

### Issue: Locust Won't Start

**Symptom**: `ModuleNotFoundError: No module named 'locust'`

**Solution**: Install dependencies
```bash
pip install -r requirements.txt
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Load Testing

on:
  push:
    branches: [main, staging]
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Monday 2am

jobs:
  load-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      
      - name: Install dependencies
        run: |
          cd tests/load
          pip install -r requirements.txt
      
      - name: Start backend
        run: |
          cd backend
          pip install -r requirements.txt
          uvicorn app.main:app --host 0.0.0.0 --port 8000 &
          sleep 10
      
      - name: Run load tests
        run: |
          cd tests/load
          
          # Database load test
          locust -f locustfile.py --host=http://localhost:8000 \
              --users 50 --spawn-rate 5 --run-time 5m --headless
          
          # Rate limiting test
          ./test_rate_limiting.sh http://localhost:8000
      
      - name: Check results
        run: |
          # Add assertions on test results
          echo "Tests completed"
```

---

## Best Practices

### 1. Test in Staging First

Always run load tests against staging environment before production.

### 2. Monitor During Tests

Keep logs and monitoring dashboards open during tests:
- Backend logs
- Database connection count
- Sentry error tracking
- System resources (CPU, memory)

### 3. Cool Down Between Tests

Allow 30-60 seconds between test runs to let:
- Connection pools drain
- Rate limiters reset
- Caches clear
- Metrics stabilize

### 4. Gradual Ramp-Up

Use `--spawn-rate` to gradually add users:
```bash
# Good: Gradual ramp
--users 50 --spawn-rate 5

# Bad: Instant surge
--users 50 --spawn-rate 50
```

### 5. Document Baselines

After each test run, document baseline metrics in `docs/PERFORMANCE_METRICS.md`.

### 6. Run Regularly

Schedule load tests:
- Before major releases
- After infrastructure changes
- Weekly in CI/CD
- After performance optimizations

---

## Further Reading

- [Locust Documentation](https://docs.locust.io/)
- [Performance Metrics Guide](../../docs/PERFORMANCE_METRICS.md)
- [Rate Limiting Implementation](../../backend/app/middleware/rate_limit_redis.py)
- [Database Configuration](../../backend/app/core/database.py)

---

**Maintained By**: Development Team  
**Last Updated**: June 5, 2026
