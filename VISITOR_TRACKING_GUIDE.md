# Visitor Tracking System - Quick Start Guide

## Overview

A complete visitor analytics system has been added to track anonymous geographic data about site visitors.

## Features

### 🌍 Geographic Tracking
- Automatic IP-based geolocation
- Country, region, city, timezone
- ISP information
- Latitude/longitude coordinates

### 📊 Analytics Dashboard
- Total visits and unique IPs
- Human vs. bot traffic filtering
- Top 10 countries with visit counts
- Top 10 cities breakdown
- Most popular pages
- Real-time recent visitor feed
- Customizable time periods (7, 30, 90, 365 days)

### 🔒 Privacy & Security
- Admin-only access to analytics
- Anonymous tracking (no personal data)
- Automatic bot detection and filtering
- Configurable data retention
- GDPR/CCPA considerations documented

### ⚡ Performance
- Non-blocking background tracking
- Cached geolocation results
- Efficient database queries with indexes
- Minimal impact on page load times

## Quick Start

### 1. Database Migration

The migration has already been run. To verify:

```bash
cd backend
source venv/bin/activate
alembic current
# Should show: b92623584324 (head) - add_visitor_tracking
```

### 2. Access Analytics

Start the backend and frontend, then:

1. Login to admin panel: `http://localhost:3000/admin-login`
2. Navigate to: `http://localhost:3000/admin/analytics`
3. Select time period and view statistics

### 3. API Endpoints

All require admin authentication:

**Get Statistics**
```bash
GET /api/v1/analytics/visitors?days=30
```

**Get Country Breakdown**
```bash
GET /api/v1/analytics/visitors/countries?days=30
```

**Get Page Views**
```bash
GET /api/v1/analytics/visitors/pages?days=30
```

**Get Recent Visitors**
```bash
GET /api/v1/analytics/visitors/recent?limit=50
```

**Clean Up Old Data**
```bash
DELETE /api/v1/analytics/visitors/cleanup?days=365
```

## What Gets Tracked

### ✅ Tracked Pages
- Home page (/)
- Articles (/articles/*)
- Projects (/projects/*)
- Resume (/resume)
- Gallery (/gallery)
- Contact (/contact)
- Tech stack (/tech)
- Academia (/academia)

### ❌ NOT Tracked
- Admin panel (/admin/*)
- API endpoints (/api/*)
- Static assets (/_next/*, /uploads/*)
- Admin login page
- Robots.txt, sitemap, favicon

### 🤖 Bot Detection
Automatically filters:
- Search engine bots (Google, Bing, etc.)
- Monitoring tools (Pingdom, UptimeRobot)
- Development tools (curl, wget, Postman)
- Headless browsers (Puppeteer, Selenium)

## Files Created

### Backend
```
backend/
├── app/
│   ├── models/visitor.py              # Database model
│   ├── schemas/visitor.py             # Pydantic schemas
│   ├── services/
│   │   ├── geolocation.py            # IP → Location lookup
│   │   └── visitor_tracking.py       # Tracking service
│   ├── middleware/
│   │   └── visitor_middleware.py     # Auto-tracking middleware
│   └── api/v1/endpoints/
│       └── analytics.py              # Analytics endpoints
├── alembic/versions/
│   └── b92623584324_*.py            # Database migration
├── SECURITY.md                       # Security docs (updated)
└── ANALYTICS.md                      # Analytics documentation
```

### Frontend
```
frontend/
└── src/app/admin/
    └── analytics/
        └── page.tsx                  # Analytics dashboard
```

## Configuration

### Environment Variables

No additional environment variables required. Uses existing database connection.

### Geolocation Service

Currently uses **ip-api.com** free tier:
- 45 requests per minute
- Results are cached in-memory

For production with high traffic, consider upgrading to:
- ip-api.com Pro
- MaxMind GeoIP2
- ipstack

See `backend/ANALYTICS.md` for details.

### Data Retention

By default, all visitor logs are kept indefinitely. Set up automatic cleanup:

**Option 1: Manual cleanup via API**
```bash
curl -X DELETE "http://localhost:8000/api/v1/analytics/visitors/cleanup?days=365" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Option 2: Cron job** (recommended for production)
```bash
# Add to crontab
0 2 * * * curl -X DELETE "http://localhost:8000/api/v1/analytics/visitors/cleanup?days=365" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Usage Examples

### View Analytics in Admin Panel

1. Login to admin panel
2. Click "Analytics" in sidebar
3. Select time period (7/30/90/365 days)
4. View:
   - Summary statistics
   - Geographic breakdown
   - Popular pages
   - Recent visitors

### Query via API

```bash
# Get last 30 days statistics
curl "http://localhost:8000/api/v1/analytics/visitors?days=30" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get country breakdown
curl "http://localhost:8000/api/v1/analytics/visitors/countries?days=30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Analytics not showing data

1. **Check tracking is enabled**
   ```python
   # In backend/app/main.py, this line should be present:
   app.add_middleware(VisitorTrackingMiddleware)
   ```

2. **Verify migration ran**
   ```bash
   cd backend
   source venv/bin/activate
   alembic current
   ```

3. **Check database**
   ```sql
   SELECT COUNT(*) FROM visitor_logs;
   ```

4. **Test geolocation**
   ```bash
   curl "http://ip-api.com/json/8.8.8.8"
   ```

### Missing geographic data

- Rate limit hit (45 req/min on free tier)
- Network connectivity issue
- Invalid IP address
- Localhost testing (shows "Local" country)

### Bot traffic showing up

Add to bot detection in `app/services/visitor_tracking.py`:

```python
BOT_KEYWORDS = [
    "bot", "crawler", "spider",
    "your-custom-bot",  # Add here
]
```

## Privacy Compliance

### GDPR
- IP addresses are considered personal data
- System can be disabled if required
- Data retention is configurable
- Users can request data deletion

### CCPA
- No sale of personal information
- No tracking for advertising
- Analytics only for site improvement

### Best Practices
- Add privacy policy mentioning analytics
- Provide opt-out mechanism if required
- Regular data cleanup (keep 1 year max)
- Consider IP anonymization for EU

## Performance Impact

### Expected Load
- Small site: ~500-1000 visits/day = 30K records/month
- Database growth: ~30-50 MB/year
- Geolocation API: Cached (minimal external calls)

### Optimization
- Background processing (non-blocking)
- Database indexes on key columns
- LRU cache for geolocation (1000 entries)
- Efficient SQL queries with aggregation

## Next Steps

### Recommended Enhancements
1. **Visual charts** - Add Chart.js/Recharts to admin panel
2. **Real-time dashboard** - WebSocket for live visitor feed
3. **Export functionality** - CSV/Excel export for reports
4. **Email reports** - Daily/weekly analytics summaries
5. **Redis cache** - Replace in-memory cache for multi-server
6. **Offline geolocation** - MaxMind database for better performance

### Production Checklist
- [ ] Review and test bot detection
- [ ] Set up automatic data cleanup cron job
- [ ] Consider upgrading geolocation service
- [ ] Add privacy policy mentioning analytics
- [ ] Configure data retention policy
- [ ] Set up monitoring/alerting for errors
- [ ] Test with production traffic volume

## Documentation

Full documentation available in:
- `backend/ANALYTICS.md` - Complete analytics guide
- `backend/SECURITY.md` - Security considerations
- `backend/app/services/visitor_tracking.py` - Implementation details

## Support

For issues or questions:
1. Check logs: `backend/logs/`
2. Review documentation
3. Test geolocation API manually
4. Verify database schema and migrations
