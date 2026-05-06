# Analytics & Visitor Tracking

This document describes the visitor tracking and analytics system.

## Overview

The portfolio automatically tracks anonymous visitor data to provide insights into:
- Geographic distribution of visitors (countries, regions, cities)
- Popular pages and content
- Traffic patterns over time
- Bot vs. human traffic

## How It Works

### 1. Automatic Tracking
- Middleware automatically tracks all successful (200-299) HTTP responses
- Tracking runs in the background without slowing down page loads
- Only public-facing pages are tracked (admin panel and API excluded)

### 2. Data Collection

**Geographic Data** (from IP address):
- Country and country code
- Region/state
- City
- Latitude/longitude
- Timezone
- ISP (Internet Service Provider)

**Request Data**:
- Page path
- HTTP method
- User agent
- Referrer

**Metadata**:
- Timestamp
- Bot detection flag

### 3. Geolocation Service

Uses **ip-api.com** free tier:
- Rate limit: 45 requests per minute
- Cached results to minimize API calls
- Automatic fallback for localhost/development
- Returns `null` on failure (doesn't break tracking)

**For Production**: Consider upgrading to:
- ip-api.com Pro (higher limits, HTTPS, commercial use)
- MaxMind GeoIP2 (offline database, no rate limits)
- ipstack or similar service

### 4. Bot Detection

Automatically filters common bots:
- Search engine crawlers (Googlebot, Bingbot, etc.)
- Monitoring tools (Pingdom, UptimeRobot, etc.)
- Development tools (curl, wget, Postman)
- Headless browsers (Phantom, Puppeteer, etc.)

Bot visits are tracked but excluded from most analytics.

## Analytics Endpoints

All endpoints require admin authentication.

### Get Overall Statistics
```http
GET /api/v1/analytics/visitors?days=30
```

Returns:
- Total visits, unique IPs
- Human vs. bot traffic
- Top 10 countries
- Top 10 cities
- Top 10 pages
- 20 most recent visits

### Get Country Statistics
```http
GET /api/v1/analytics/visitors/countries?days=30
```

Returns detailed country-level breakdown.

### Get Page Statistics
```http
GET /api/v1/analytics/visitors/pages?days=30
```

Returns page view statistics.

### Get Recent Visitors
```http
GET /api/v1/analytics/visitors/recent?limit=50
```

Returns most recent visitor logs (excludes bots).

### Clean Up Old Logs
```http
DELETE /api/v1/analytics/visitors/cleanup?days=365
```

Deletes visitor logs older than specified days.

## Privacy Considerations

### What Is Tracked
✅ Anonymous visitor data (IP, location, pages viewed)  
✅ Public-facing pages only  
✅ Aggregated statistics  

### What Is NOT Tracked
❌ Personal identifying information  
❌ User accounts or login data  
❌ Cookies or local storage  
❌ Tracking across sessions  
❌ Admin panel activity  
❌ API calls  

### Compliance

**GDPR**:
- IP addresses are considered personal data under GDPR
- System can be disabled for EU visitors if required
- Data retention period is configurable
- Users can request data deletion

**CCPA**:
- No sale of personal information
- No tracking for advertising purposes
- Analytics used only for site improvement

## Configuration

### Enable/Disable Tracking

To disable tracking entirely, comment out the middleware in `app/main.py`:

```python
# app.add_middleware(VisitorTrackingMiddleware)
```

### Exclude Additional Paths

Edit `app/services/visitor_tracking.py`:

```python
def should_track_path(path: str) -> bool:
    exclude_prefixes = [
        "/api/",
        "/admin/",
        "/your-custom-path/",  # Add here
    ]
    return not any(path.startswith(prefix) for prefix in exclude_prefixes)
```

### Change Geolocation Provider

Edit `app/services/geolocation.py` to use a different service:

```python
class GeolocationService:
    BASE_URL = "https://your-api-provider.com"
    # Update get_location() method
```

### Data Retention

Set up a cron job to automatically clean up old data:

```bash
# Clean up logs older than 365 days, daily at 2 AM
0 2 * * * curl -X DELETE "http://localhost:8000/api/v1/analytics/visitors/cleanup?days=365" \
    -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Admin Panel

Access analytics at: `/admin/analytics`

Features:
- Time period selection (7, 30, 90, 365 days)
- Summary statistics dashboard
- Top countries with visit counts
- Top cities breakdown
- Most popular pages
- Real-time recent visitor list
- Visual charts (if implemented)

## Database Schema

Table: `visitor_logs`

```sql
CREATE TABLE visitor_logs (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45),
    country VARCHAR(100),
    country_code VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    latitude VARCHAR(20),
    longitude VARCHAR(20),
    timezone VARCHAR(50),
    isp VARCHAR(200),
    path VARCHAR(500),
    method VARCHAR(10),
    user_agent TEXT,
    referer TEXT,
    is_bot BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_visitor_logs_country ON visitor_logs(country);
CREATE INDEX idx_visitor_logs_created_at ON visitor_logs(created_at);
CREATE INDEX idx_visitor_logs_is_bot ON visitor_logs(is_bot);
CREATE INDEX idx_visitor_logs_path ON visitor_logs(path);
```

## Performance Considerations

### Rate Limiting
- Geolocation API: 45 requests/minute (free tier)
- Results cached in-memory (LRU cache, 1000 entries)
- Middleware runs asynchronously (non-blocking)

### Database Growth
- Expect ~500-1000 records per day for small sites
- ~30-180 MB per year (depending on traffic)
- Regular cleanup recommended (keep 1 year, delete older)

### Optimization Tips
1. Add database indexes on frequently queried columns
2. Use Redis cache for geolocation results in production
3. Consider upgrading to offline geolocation database (MaxMind)
4. Implement data aggregation for long-term storage

## Troubleshooting

### Geolocation Not Working
- Check ip-api.com rate limits (45/min)
- Verify IP address extraction from proxy headers
- Test with: `curl http://ip-api.com/json/8.8.8.8`

### Analytics Not Updating
- Check middleware is registered in `app/main.py`
- Verify database migrations ran successfully
- Check logs for tracking errors
- Ensure admin authentication is working

### Missing Data
- Verify paths are not in exclude list
- Check bot detection isn't too aggressive
- Confirm HTTP responses are 200-299 status codes

## Example Queries

### Most popular pages this month
```python
from datetime import datetime, timedelta
from sqlalchemy import func

since = datetime.utcnow() - timedelta(days=30)
results = (
    db.query(VisitorLog.path, func.count(VisitorLog.id))
    .filter(VisitorLog.created_at >= since, VisitorLog.is_bot == False)
    .group_by(VisitorLog.path)
    .order_by(func.count(VisitorLog.id).desc())
    .limit(10)
    .all()
)
```

### Visitors by hour of day
```python
results = (
    db.query(
        func.extract('hour', VisitorLog.created_at).label('hour'),
        func.count(VisitorLog.id)
    )
    .filter(VisitorLog.is_bot == False)
    .group_by('hour')
    .order_by('hour')
    .all()
)
```

### Unique visitors per country
```python
results = (
    db.query(
        VisitorLog.country,
        func.count(func.distinct(VisitorLog.ip_address))
    )
    .filter(VisitorLog.is_bot == False)
    .group_by(VisitorLog.country)
    .all()
)
```
