# QR Code Scan Tracking Architecture Research

## Executive Summary

To track QR code scans natively, Qrius needs to transition from a static client-side app to a dynamic system with backend infrastructure. This document covers architecture options, database design, API specifications, and implementation considerations.

---

## How QR Tracking Works

### The Fundamental Concept

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User scans    │────▶│  Qrius Server   │────▶│   Destination   │
│    QR Code      │     │  (Redirect +    │     │     URL         │
│                 │     │   Log scan)     │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │    Database     │
                        │  (Scan logs,    │
                        │   Analytics)    │
                        └─────────────────┘
```

**Static QR Code:** Encodes `https://example.com/page` → No tracking possible

**Dynamic QR Code:** Encodes `https://qrius.app/r/abc123` → Server logs scan, then redirects to `https://example.com/page`

### What Gets Tracked

| Data Point | Source | Privacy Level |
|------------|--------|---------------|
| Scan count | Server logs | Low risk |
| Timestamp | Server clock | Low risk |
| Country/City | IP geolocation | Medium risk |
| Device type | User-Agent header | Medium risk |
| OS/Browser | User-Agent parsing | Medium risk |
| Referrer | Referer header | Low risk |
| Exact IP | Request headers | High risk (PII) |

---

## Architecture Options

### Option A: Serverless (Recommended for MVP)

**Stack:** Vercel/Cloudflare Workers + Vercel KV/Upstash Redis + Vercel Postgres

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel Edge                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Edge      │───▶│   Vercel    │───▶│   Vercel    │         │
│  │  Function   │    │   KV/Redis  │    │  Postgres   │         │
│  │ (Redirect)  │    │  (Counters) │    │ (Full logs) │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Zero server management
- Auto-scaling
- Global edge deployment (fast redirects worldwide)
- Pay-per-use pricing
- Easy deployment from GitHub

**Cons:**
- Vendor lock-in
- Cold starts (mitigated by edge functions)
- Limited compute time per request

**Cost Estimate (100K scans/month):**
| Service | Cost |
|---------|------|
| Vercel Pro | $20/month |
| Vercel KV | $0 (included) |
| Vercel Postgres | $0 (included, 256MB) |
| **Total** | **~$20/month** |

---

### Option B: Traditional Server

**Stack:** Node.js/Fastify + PostgreSQL + Redis + Docker

```
┌─────────────────────────────────────────────────────────────────┐
│                      Railway / Render / Fly.io                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Node.js   │───▶│    Redis    │───▶│  PostgreSQL │         │
│  │   Fastify   │    │  (Counters  │    │ (Persistent │         │
│  │   Server    │    │   + Cache)  │    │    Data)    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Full control
- No vendor lock-in
- Complex business logic possible
- Websocket support for real-time analytics

**Cons:**
- Server management overhead
- Manual scaling
- Higher base cost

**Cost Estimate:**
| Service | Cost |
|---------|------|
| Railway (Server) | $5-20/month |
| Railway (Postgres) | $5/month |
| Railway (Redis) | $5/month |
| **Total** | **~$15-30/month** |

---

### Option C: Hybrid (Best of Both)

**Stack:** Cloudflare Workers (redirect) + Cloudflare D1/KV + Separate API server

```
┌─────────────────────────────────────────────────────────────────┐
│                     Cloudflare Edge (Global)                     │
│  ┌─────────────┐    ┌─────────────┐                             │
│  │   Worker    │───▶│  D1 / KV    │                             │
│  │ (Redirect)  │    │ (Fast logs) │                             │
│  └─────────────┘    └──────┬──────┘                             │
└────────────────────────────┼────────────────────────────────────┘
                             │ Async sync
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Your API Server                             │
│  ┌─────────────┐    ┌─────────────┐                             │
│  │  Analytics  │◀───│  PostgreSQL │                             │
│  │     API     │    │ (Full data) │                             │
│  └─────────────┘    └─────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Ultra-fast redirects at edge
- Scalable analytics processing
- Best latency for end users
- Can handle millions of scans

**Cons:**
- More complex architecture
- Two systems to maintain

---

## Database Schema

### Core Tables

```sql
-- QR Codes (Dynamic codes that can be tracked)
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  short_code VARCHAR(12) UNIQUE NOT NULL, -- e.g., "abc123"

  -- Destination
  destination_url TEXT NOT NULL,
  qr_type VARCHAR(20) NOT NULL, -- 'url', 'vcard', 'wifi', etc.
  original_data JSONB, -- Store original form data

  -- Metadata
  name VARCHAR(255),
  folder_id UUID REFERENCES folders(id),
  tags TEXT[],

  -- Settings
  is_active BOOLEAN DEFAULT true,
  password_hash VARCHAR(255), -- Optional password protection
  expires_at TIMESTAMPTZ,
  scan_limit INTEGER, -- Optional max scans

  -- Stats (denormalized for fast reads)
  total_scans INTEGER DEFAULT 0,
  unique_scans INTEGER DEFAULT 0,
  last_scan_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qr_codes_short_code ON qr_codes(short_code);
CREATE INDEX idx_qr_codes_user_id ON qr_codes(user_id);

-- Scan Events (Individual scan logs)
CREATE TABLE scan_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,

  -- Timing
  scanned_at TIMESTAMPTZ DEFAULT NOW(),

  -- Geographic
  country_code CHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),

  -- Device
  device_type VARCHAR(20), -- 'mobile', 'tablet', 'desktop'
  os VARCHAR(50),
  os_version VARCHAR(20),
  browser VARCHAR(50),
  browser_version VARCHAR(20),

  -- Network
  ip_hash VARCHAR(64), -- SHA256 of IP (privacy-preserving)
  is_unique BOOLEAN DEFAULT true, -- First scan from this IP hash

  -- Context
  referrer TEXT,
  user_agent TEXT
);

CREATE INDEX idx_scan_events_qr_code_id ON scan_events(qr_code_id);
CREATE INDEX idx_scan_events_scanned_at ON scan_events(scanned_at);
CREATE INDEX idx_scan_events_country ON scan_events(country_code);

-- Daily Aggregates (For fast dashboard queries)
CREATE TABLE scan_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  total_scans INTEGER DEFAULT 0,
  unique_scans INTEGER DEFAULT 0,

  -- Top countries (JSONB for flexibility)
  countries JSONB DEFAULT '{}', -- {"US": 150, "UK": 75, ...}
  devices JSONB DEFAULT '{}',   -- {"mobile": 200, "desktop": 50}

  UNIQUE(qr_code_id, date)
);

CREATE INDEX idx_scan_aggregates_date ON scan_aggregates(qr_code_id, date);

-- Users (Basic auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),

  -- Plan
  plan VARCHAR(20) DEFAULT 'free', -- 'free', 'pro', 'business'

  -- Limits
  qr_codes_limit INTEGER DEFAULT 10,
  scans_limit INTEGER DEFAULT 1000, -- Per month

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Folders (Organization)
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7), -- Hex color
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### TypeScript Types

```typescript
// Database types (generated from schema)
interface QRCode {
  id: string;
  userId: string;
  shortCode: string;
  destinationUrl: string;
  qrType: 'url' | 'text' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard' | 'event' | 'location';
  originalData: Record<string, unknown>;
  name?: string;
  folderId?: string;
  tags: string[];
  isActive: boolean;
  passwordHash?: string;
  expiresAt?: Date;
  scanLimit?: number;
  totalScans: number;
  uniqueScans: number;
  lastScanAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ScanEvent {
  id: string;
  qrCodeId: string;
  scannedAt: Date;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  os?: string;
  osVersion?: string;
  browser?: string;
  browserVersion?: string;
  ipHash: string;
  isUnique: boolean;
  referrer?: string;
  userAgent?: string;
}

interface ScanAggregate {
  id: string;
  qrCodeId: string;
  date: string; // YYYY-MM-DD
  totalScans: number;
  uniqueScans: number;
  countries: Record<string, number>;
  devices: Record<string, number>;
}

// Analytics response types
interface QRCodeAnalytics {
  qrCode: QRCode;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalScans: number;
    uniqueScans: number;
    avgScansPerDay: number;
    peakDay: { date: string; scans: number };
  };
  timeSeries: Array<{
    date: string;
    scans: number;
    uniqueScans: number;
  }>;
  geographic: {
    countries: Array<{ code: string; name: string; scans: number; percentage: number }>;
    cities: Array<{ city: string; country: string; scans: number }>;
  };
  devices: {
    types: Array<{ type: string; scans: number; percentage: number }>;
    os: Array<{ os: string; scans: number; percentage: number }>;
    browsers: Array<{ browser: string; scans: number; percentage: number }>;
  };
  recentScans: ScanEvent[];
}
```

---

## API Design

### Redirect Endpoint (Critical Path - Must Be Fast)

```
GET /r/:shortCode
```

**Flow:**
1. Look up QR code by shortCode (cached in Redis/KV)
2. Check if active, not expired, under scan limit
3. Log scan event (async, non-blocking)
4. Return 302 redirect to destination

**Response:**
```http
HTTP/1.1 302 Found
Location: https://example.com/destination
Cache-Control: no-cache, no-store
X-Qrius-Scan-Id: evt_abc123
```

**Edge Function Example (Cloudflare Workers):**

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const shortCode = url.pathname.split('/')[2]; // /r/:shortCode

    // 1. Get QR code from KV (fast)
    const qrData = await env.QR_CODES.get(shortCode, 'json');

    if (!qrData || !qrData.isActive) {
      return new Response('QR code not found', { status: 404 });
    }

    // 2. Check expiration
    if (qrData.expiresAt && new Date(qrData.expiresAt) < new Date()) {
      return new Response('QR code expired', { status: 410 });
    }

    // 3. Log scan asynchronously (don't block redirect)
    const scanData = {
      qrCodeId: qrData.id,
      scannedAt: new Date().toISOString(),
      country: request.cf?.country,
      city: request.cf?.city,
      userAgent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer'),
    };

    // Fire and forget - write to queue for processing
    await env.SCAN_QUEUE.send(scanData);

    // 4. Redirect immediately
    return Response.redirect(qrData.destinationUrl, 302);
  }
};
```

---

### Analytics API Endpoints

```
Base URL: https://api.qrius.app/v1
Authentication: Bearer token (JWT)
```

#### Create Dynamic QR Code

```
POST /qr-codes
```

**Request:**
```json
{
  "destinationUrl": "https://example.com/landing",
  "qrType": "url",
  "name": "Summer Campaign 2025",
  "folderId": "folder_123",
  "tags": ["marketing", "summer"],
  "expiresAt": "2025-12-31T23:59:59Z",
  "scanLimit": 10000
}
```

**Response:**
```json
{
  "id": "qr_abc123",
  "shortCode": "xK9mP2",
  "shortUrl": "https://qrius.app/r/xK9mP2",
  "destinationUrl": "https://example.com/landing",
  "qrType": "url",
  "name": "Summer Campaign 2025",
  "isActive": true,
  "totalScans": 0,
  "createdAt": "2025-06-15T10:30:00Z"
}
```

#### Get QR Code Analytics

```
GET /qr-codes/:id/analytics?period=30d
```

**Query Parameters:**
- `period`: `7d`, `30d`, `90d`, `12m`, `all`, or custom range
- `start`: ISO date (for custom range)
- `end`: ISO date (for custom range)
- `timezone`: IANA timezone (default: UTC)

**Response:**
```json
{
  "qrCode": {
    "id": "qr_abc123",
    "shortCode": "xK9mP2",
    "name": "Summer Campaign 2025"
  },
  "period": {
    "start": "2025-05-15T00:00:00Z",
    "end": "2025-06-15T00:00:00Z"
  },
  "summary": {
    "totalScans": 15420,
    "uniqueScans": 12350,
    "avgScansPerDay": 514,
    "peakDay": {
      "date": "2025-06-01",
      "scans": 2150
    }
  },
  "timeSeries": [
    { "date": "2025-06-14", "scans": 520, "uniqueScans": 485 },
    { "date": "2025-06-13", "scans": 480, "uniqueScans": 445 }
  ],
  "geographic": {
    "countries": [
      { "code": "US", "name": "United States", "scans": 8500, "percentage": 55.1 },
      { "code": "GB", "name": "United Kingdom", "scans": 2100, "percentage": 13.6 },
      { "code": "DE", "name": "Germany", "scans": 1200, "percentage": 7.8 }
    ],
    "cities": [
      { "city": "New York", "country": "US", "scans": 1850 },
      { "city": "London", "country": "GB", "scans": 1200 }
    ]
  },
  "devices": {
    "types": [
      { "type": "mobile", "scans": 12800, "percentage": 83.0 },
      { "type": "desktop", "scans": 2100, "percentage": 13.6 },
      { "type": "tablet", "scans": 520, "percentage": 3.4 }
    ],
    "os": [
      { "os": "iOS", "scans": 7200, "percentage": 46.7 },
      { "os": "Android", "scans": 5600, "percentage": 36.3 }
    ],
    "browsers": [
      { "browser": "Safari", "scans": 6800, "percentage": 44.1 },
      { "browser": "Chrome", "scans": 5200, "percentage": 33.7 }
    ]
  }
}
```

#### List Recent Scans

```
GET /qr-codes/:id/scans?limit=50&offset=0
```

**Response:**
```json
{
  "scans": [
    {
      "id": "evt_xyz789",
      "scannedAt": "2025-06-15T14:32:10Z",
      "country": "United States",
      "city": "San Francisco",
      "deviceType": "mobile",
      "os": "iOS 18",
      "browser": "Safari",
      "isUnique": true
    }
  ],
  "pagination": {
    "total": 15420,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Bulk Analytics (Dashboard)

```
GET /analytics/dashboard
```

**Response:**
```json
{
  "period": "30d",
  "totalQRCodes": 45,
  "activeQRCodes": 42,
  "totalScans": 125000,
  "uniqueScans": 98000,
  "topPerformers": [
    {
      "id": "qr_abc123",
      "name": "Summer Campaign",
      "scans": 15420,
      "trend": "+12.5%"
    }
  ],
  "recentActivity": [
    {
      "qrCodeId": "qr_abc123",
      "qrCodeName": "Summer Campaign",
      "scans": 52,
      "period": "1h"
    }
  ]
}
```

---

## Frontend Analytics Dashboard

### Component Structure

```
src/components/analytics/
├── AnalyticsDashboard.tsx      # Main dashboard page
├── QRCodeAnalytics.tsx         # Single QR code detail view
├── charts/
│   ├── ScanTimeSeriesChart.tsx # Line chart for scans over time
│   ├── GeoMapChart.tsx         # World map with scan locations
│   ├── DevicePieChart.tsx      # Device breakdown
│   └── TopCountriesBar.tsx     # Horizontal bar chart
├── widgets/
│   ├── StatCard.tsx            # KPI cards (total scans, etc.)
│   ├── RecentScansTable.tsx    # Live scan feed
│   └── QRCodeListItem.tsx      # QR code row with mini stats
└── hooks/
    ├── useAnalytics.ts         # Data fetching hook
    └── useRealTimeScans.ts     # WebSocket for live updates
```

### Recommended Chart Library

**Recharts** (Already React-friendly, lightweight)
- Line charts for time series
- Pie charts for device breakdown
- Bar charts for geographic data

**Or Tremor** (Tailwind-native, beautiful defaults)
- Pre-built dashboard components
- Matches existing Tailwind styling

### Key Dashboard Views

1. **Overview Dashboard**
   - Total scans (all QR codes)
   - Scans trend chart (7/30/90 days)
   - Top performing QR codes
   - Recent scan activity feed

2. **Individual QR Code Analytics**
   - Scan count with trend
   - Time series chart
   - Geographic breakdown (map + table)
   - Device/OS/Browser breakdown
   - Recent scans list

3. **Real-time View**
   - Live scan counter
   - Globe visualization with scan locations
   - Activity stream

---

## Privacy Considerations

### GDPR Compliance

1. **IP Addresses**
   - Never store raw IPs
   - Hash IPs with salt for uniqueness detection
   - Auto-delete hashes after 30 days

2. **Geolocation**
   - Only store country/city level (not precise coordinates)
   - Derived from IP at scan time, then IP discarded

3. **User Consent**
   - QR code creators must agree to ToS
   - End users (scanners) see privacy notice on redirect page (optional)

4. **Data Retention**
   - Scan events: 12 months (then aggregate)
   - Aggregates: Indefinite
   - Deleted QR codes: Purge all data after 30 days

### Privacy-Preserving Architecture

```typescript
// At scan time
const ipHash = await crypto.subtle.digest(
  'SHA-256',
  new TextEncoder().encode(ip + dailySalt)
);

// Store only the hash, never the IP
// Daily salt rotation prevents long-term tracking
```

---

## Implementation Phases

### Phase 1: Core Redirect + Basic Tracking (2 weeks)

**Deliverables:**
- [ ] Set up Vercel project with Edge Functions
- [ ] Implement `/r/:shortCode` redirect endpoint
- [ ] Basic database schema (QR codes + scan events)
- [ ] API: Create QR code, Get QR code
- [ ] Simple scan logging (count, timestamp, country)
- [ ] Update Qrius app to generate trackable QR codes

### Phase 2: Analytics API (2 weeks)

**Deliverables:**
- [ ] Analytics endpoints (time series, geographic, devices)
- [ ] Daily aggregation job
- [ ] User authentication (JWT)
- [ ] Rate limiting
- [ ] API documentation

### Phase 3: Dashboard UI (2-3 weeks)

**Deliverables:**
- [ ] Analytics dashboard in Qrius app
- [ ] Charts (time series, pie, bar, map)
- [ ] QR code management (list, edit, delete)
- [ ] Export to CSV/PDF

### Phase 4: Advanced Features (2-3 weeks)

**Deliverables:**
- [ ] Real-time scan updates (WebSocket)
- [ ] Custom short codes
- [ ] Password-protected QR codes
- [ ] Expiring QR codes
- [ ] A/B testing (multiple destinations)
- [ ] Webhook notifications

---

## Cost Projections

### Startup (0-10K scans/month)
| Service | Cost |
|---------|------|
| Vercel Hobby | $0 |
| Vercel KV (Free tier) | $0 |
| Vercel Postgres (Free tier) | $0 |
| **Total** | **$0** |

### Growth (10K-100K scans/month)
| Service | Cost |
|---------|------|
| Vercel Pro | $20 |
| Vercel KV | $0-5 |
| Vercel Postgres | $0-20 |
| **Total** | **$20-45/month** |

### Scale (100K-1M scans/month)
| Service | Cost |
|---------|------|
| Vercel Pro | $20 |
| Vercel KV | $20-50 |
| Vercel Postgres | $50-100 |
| Cloudflare (CDN) | $20 |
| **Total** | **$110-190/month** |

---

## Competitor Reference

| Feature | QR Code Generator | Beaconstac | QR Tiger | Qrius (Target) |
|---------|-------------------|------------|----------|----------------|
| Scan tracking | Pro ($5+/mo) | All plans | Pro ($7+/mo) | Free tier (limited) |
| Real-time | Enterprise | Yes | Pro | Phase 4 |
| Geographic | Yes | Yes | Yes | Phase 2 |
| Device stats | Yes | Yes | Yes | Phase 2 |
| Custom domains | Enterprise | Business | Pro | Via branded URLs |
| API access | Enterprise | Business | Pro | Phase 2 |
| Bulk create | Yes | Yes | Yes | Phase 3 |
| A/B testing | No | Yes | No | Phase 4 |

---

## Recommendation

**Start with Option A (Serverless on Vercel)** for these reasons:

1. **Zero ops overhead** - Focus on features, not infrastructure
2. **Scales automatically** - Handles traffic spikes from viral QR codes
3. **Edge deployment** - Sub-50ms redirects globally
4. **Cost-effective** - Free to start, predictable scaling costs
5. **Easy integration** - Vercel already hosts React apps well

**Key decision:** Use Cloudflare Workers for the redirect endpoint if sub-20ms latency is critical, with Vercel for the main API and dashboard.

---

## Next Steps

1. **Validate with users** - Do they want tracking built-in or are third-party integrations sufficient?
2. **Define MVP scope** - What's the minimum tracking needed to differentiate?
3. **Choose hosting** - Vercel vs Cloudflare vs hybrid
4. **Design API** - Finalize endpoints and auth strategy
5. **Build Phase 1** - Core redirect infrastructure

---

## Questions to Resolve

1. Should free users get limited tracking (e.g., 3 trackable QR codes, 30-day history)?
2. Do we need real-time updates for MVP or can it be polling-based?
3. Should we integrate with Google Analytics / Mixpanel as an alternative?
4. Do we want webhook support for enterprise customers?
5. Should QR codes be editable (change destination without regenerating)?
