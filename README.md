# NEXUS — Business Intelligence & Connection Platform

> A map-first business intelligence network. Explore companies geographically, view rich company insights, and connect as a buyer, seller, or investor.

![NEXUS Platform](docs/screenshot.png)

---

## ✨ Features

- **Interactive Map** — Clustered business markers powered by Mapbox GL JS
- **Company Intelligence** — Age, valuation, employees, YoY growth, recent updates
- **Connection System** — Send typed requests (Buyer / Seller / Investor) with messages
- **Advanced Filters** — Business type, industry, age range, valuation, radius
- **Heatmap View** — Visualise business density zones
- **Trending Companies** — Real-time leaderboard of activity
- **Bookmarks** — Save companies to your watchlist
- **Compare Mode** — Side-by-side company comparison
- **Search Autocomplete** — Fuzzy search across name, industry, location
- **Auth** — JWT-based login/signup with role support (user vs business)

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| Map | Mapbox GL JS + supercluster |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 15 + PostGIS |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Cache | Redis |
| Real-time | Socket.io |
| Testing | Jest + Supertest |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15 with PostGIS extension
- Redis
- Mapbox account (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/yourname/nexus.git
cd nexus

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Environment variables

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

Fill in the values — see [Environment Variables](#environment-variables) below.

### 3. Database setup

```bash
cd backend

# Run migrations
npx prisma migrate dev

# Seed with 500 sample companies
npm run seed
```

### 4. Start development servers

```bash
# Terminal 1 — Backend (port 4000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🌍 Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nexus"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV=development

# Optional: real email notifications
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6..."
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_WS_URL="http://localhost:4000"
```

---

## 📁 Project Structure

```
nexus/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Sample data seeder
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth, error handling, rate limiting
│   │   ├── models/             # Business logic
│   │   ├── routes/             # Express routers
│   │   ├── services/           # DB queries, external APIs
│   │   └── utils/              # Helpers
│   └── tests/                  # Jest test suites
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   ├── components/
│   │   │   ├── map/            # Map, markers, clusters, heatmap
│   │   │   ├── sidebar/        # Filters panel
│   │   │   ├── panels/         # Company detail, connect modal
│   │   │   └── ui/             # Shared UI primitives
│   │   ├── hooks/              # useCompanies, useFilters, useAuth
│   │   ├── lib/                # API client, mapbox config
│   │   ├── store/              # Zustand global state
│   │   └── types/              # Shared TypeScript types
│   └── public/
└── scripts/                    # Data import utilities
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/auth/me` | Current user |

### Companies
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/companies` | List with filters |
| GET | `/api/companies/:id` | Single company |
| GET | `/api/companies/search` | Autocomplete search |
| GET | `/api/companies/trending` | Trending list |
| POST | `/api/companies` | Create company (business role) |

### Connections
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/connections` | Send request |
| GET | `/api/connections` | My requests |
| PATCH | `/api/connections/:id` | Accept / decline |

### Bookmarks
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookmarks/:companyId` | Save company |
| DELETE | `/api/bookmarks/:companyId` | Remove |
| GET | `/api/bookmarks` | My saved list |

---

## 🗺️ Geospatial Queries

Companies are stored with a PostGIS `GEOGRAPHY(POINT)` column. The `/api/companies` endpoint supports:

```
GET /api/companies?lat=-33.86&lng=151.20&radius=250&unit=km
```

Internally uses `ST_DWithin` for efficient indexed radius queries.

---

## 🧪 Tests

```bash
cd backend
npm test               # All tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

---

## 📦 Sample Dataset

`backend/prisma/seed.ts` generates **500 companies** across 6 continents with realistic:
- Names, industries, business types
- Founded dates (1970–2023)
- Employee counts + valuations
- Geographic coordinates
- Recent activity updates

To import real data from public registries, see `scripts/import-companies-house.ts` (UK) and `scripts/import-asic.ts` (Australia).

---

## 🔮 Roadmap

- [ ] AI matchmaking (OpenAI embeddings on company descriptions)
- [ ] Investment recommendation engine
- [ ] Real-time activity feed via webhooks
- [ ] Mobile app (React Native)
- [ ] Third-party API for developers

---

## 📄 License

MIT
