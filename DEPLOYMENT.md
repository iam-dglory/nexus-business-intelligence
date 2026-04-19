# Deployment Guide

## Options

### Option A — Docker Compose (simplest)

Works on any Linux VPS (DigitalOcean, Hetzner, Linode, etc.)

```bash
# On your server
git clone https://github.com/yourname/nexus.git
cd nexus

# Create .env files
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Set your Mapbox token
export NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1..."

docker-compose -f docker-compose.yml up -d --build
```

Open port 3000 (frontend) and 4000 (API) in your firewall, then point your domain via Nginx reverse proxy.

### Option B — Vercel (frontend) + Railway (backend + DB)

**Frontend on Vercel:**
```bash
cd frontend
npx vercel --prod
# Set environment variables in Vercel dashboard:
#   NEXT_PUBLIC_MAPBOX_TOKEN
#   NEXT_PUBLIC_API_URL  (your Railway backend URL)
#   NEXT_PUBLIC_WS_URL
```

**Backend + PostgreSQL + Redis on Railway:**
1. Create a new Railway project
2. Add a PostgreSQL service (Railway auto-provisions PostGIS)
3. Add a Redis service
4. Deploy the `backend/` directory
5. Set environment variables from `backend/.env.example`
6. Run the seed: `railway run npm run seed`

### Option C — AWS (production scale)

Architecture:
```
Route 53 → CloudFront → S3 (Next.js static export)
                      → ALB → ECS Fargate (backend)
                                    → RDS PostgreSQL (PostGIS enabled)
                                    → ElastiCache Redis
```

Use the provided Dockerfiles. Enable `output: 'standalone'` in `next.config.js` for the ECS deployment.

---

## Nginx reverse proxy (Option A)

```nginx
server {
    listen 80;
    server_name nexus.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name nexus.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/nexus.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nexus.yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API + WebSocket
    location /api {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## Environment variables checklist for production

### Backend
| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | Use connection pooling (PgBouncer) at scale |
| `REDIS_URL` | ✅ | |
| `JWT_SECRET` | ✅ | Min 32 chars, random |
| `FRONTEND_URL` | ✅ | For CORS |
| `ANTHROPIC_API_KEY` | ⬜ | Enables AI insights |
| `SMTP_*` | ⬜ | Enables real email |

### Frontend
| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | ✅ | Free tier: 50k loads/month |
| `NEXT_PUBLIC_API_URL` | ✅ | Full URL including `/api` |
| `NEXT_PUBLIC_WS_URL` | ✅ | Socket.io endpoint |

---

## Database performance at scale

For 100k+ companies, add these indexes beyond the migration:

```sql
-- Partial index for active companies only
CREATE INDEX companies_active_industry_idx
  ON companies (industry)
  WHERE "isActive" = true;

-- Covering index for map endpoint
CREATE INDEX companies_map_idx
  ON companies (lat, lng, "businessType", industry)
  WHERE "isActive" = true;

-- Full-text search
ALTER TABLE companies ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name,'') || ' ' || coalesce(industry,'') || ' ' || coalesce(city,''))
  ) STORED;

CREATE INDEX companies_fts_idx ON companies USING GIN(search_vector);
```
