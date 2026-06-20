# SecureWatch - Cybersecurity Threat Monitoring Dashboard

> Enterprise-grade Security Operations Center (SOC) dashboard built with React 19, Node.js, TypeScript, and PostgreSQL.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![Node](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19 + Vite)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │   Auth    │  │Dashboard │  │  Threats │  │  Analytics   │ │
│  │   Pages   │  │  Widgets │  │  Module  │  │   Charts    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         TanStack Query  |  React Router  |  Axios    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────┘
                                 │ HTTP / WebSocket
┌────────────────────────────────┴────────────────────────────┐
│                    Backend (Express.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  Auth    │  │  Threat  │  │Incident  │  │ Notification│ │
│  │ Service  │  │ Service  │  │ Service  │  │  Service    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘ │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   JWT  |  Helmet  |  CORS  |  Rate Limit  |  Zod    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────┘
                                 │ Prisma ORM
┌────────────────────────────────┴────────────────────────────┐
│                  PostgreSQL Database                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  Users   │  │ Threats  │  │Incidents │  │  AuditLogs  │ │
│  │ Sessions │  │  Feeds   │  │    Notif  │  │             │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## ER Diagram

```
┌─────────┐       ┌──────────┐       ┌───────────┐
│  User   │1──N──>│  Session │       │  Threat   │
│─────────│       │──────────│       │────────────│
│ id      │       │ id       │       │ id         │
│ email   │       │ refresh..│       │ title      │
│ password│       │ expiresAt│       │ sourceIP   │
│ role    │       │ ipAddress│       │ attackType │
│ isActive│       │ userId   │       │ severity   │
│ lastLogin│      └──────────┘       │ status     │
└────┬────┘                          │ assignedTo │
     │                               └──────┬─────┘
     │1                                     │N
     │                                      │
     │N                                     │1
┌────┴──────────┐                  ┌────────┴──────────┐
│  Notification │                  │     Incident      │
│───────────────│                  │───────────────────│
│ id            │                  │ id                │
│ userId        │                  │ title             │
│ title         │                  │ priority          │
│ message       │                  │ status            │
│ type          │                  │ threatId          │
│ read          │                  │ assignedToId      │
│ link          │                  │ createdById       │
│ createdAt     │                  │ closedAt          │
└───────────────┘                  └───────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  AuditLog    │    │  ThreatFeed  │    │              │
│──────────────│    │──────────────│    │              │
│ id           │    │ id           │    │              │
│ userId       │    │ type         │    │              │
│ userEmail    │    │ value        │    │              │
│ action       │    │ riskScore    │    │              │
│ entity       │    │ isActive     │    │              │
│ entityId     │    │ source       │    │              │
│ ipAddress    │    │ createdAt    │    │              │
│ createdAt    │    └──────────────┘    └──────────────┘
└──────────────┘
```

---

## Features

### Authentication & Authorization
- Register, Login, Logout, Forgot/Reset Password
- JWT Access + Refresh Token rotation
- Role-Based Access Control (Admin, Analyst, Viewer)
- Secure HTTP-only cookies + CSRF protection

### Dashboard
- Real-time threat monitoring widgets
- Threat trend line chart (7-day)
- Severity distribution pie chart (donut)
- Top attack sources bar chart
- Recent security events feed
- Loading skeletons and empty states

### Threat Management
- Full CRUD with search, filter, sort, pagination
- Severity levels: Critical, High, Medium, Low
- Status workflow: New → Investigating → Mitigated → Resolved
- Assign analysts to threats

### Incident Management
- Create incidents linked to threats
- Priority and status tracking
- Assign analysts with notes
- Incident timeline

### Threat Intelligence
- IP reputation lookup against known malicious feeds
- Domain risk scoring
- Manage threat feed entries
- Risk score calculation engine

### Analytics
- Threats by month (bar chart)
- Severity distribution
- Attack type breakdown
- Incident resolution time
- Top threat sources

### User Management (Admin)
- Create, edit, disable, delete users
- Role assignment
- Last login tracking
- Activity overview

### Audit Logging
- Track every user action
- Filter by action, entity, user, date range
- IP address and timestamp capture

### Notifications
- Real-time via Socket.IO
- Notification center with read/unread
- Push on: new threats, incident assignments, critical alerts

### Additional
- Dark/Light theme toggle
- Global search
- Responsive mobile layout
- Export capabilities
- Loading skeletons
- Error boundaries
- Profile & settings pages

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Dev server & bundler |
| Tailwind CSS v3 | Utility-first styling |
| ShadCN UI | Accessible component primitives |
| React Router v7 | Client-side routing |
| TanStack Query v5 | Server state management |
| Axios | HTTP client |
| React Hook Form | Form management |
| Zod | Schema validation |
| Recharts | Data visualization |
| Socket.IO Client | Real-time updates |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 20 | Runtime |
| Express.js 4 | Web framework |
| TypeScript | Type safety |
| Prisma ORM 5 | Database access |
| PostgreSQL 16 | Database |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| Socket.IO | WebSocket server |
| Zod | Request validation |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |
| swagger-jsdoc | API documentation |

---

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (for PostgreSQL)
- npm or yarn

### Installation

#### 1. Clone & Install Dependencies
```bash
cd securewatch

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Environment Setup
```bash
# Backend
cp backend/.env.example backend/.env
# Edit .env if needed (defaults work with Docker)

# Frontend
# VITE_API_URL defaults to http://localhost:3001/api via proxy
# No .env needed for development
```

#### 3. Start Database
```bash
docker compose up postgres -d
```

#### 4. Database Setup
```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npx prisma db push

# Seed with sample data (100 threats, 50 incidents, 20 users, 200 audit logs)
npm run prisma:seed
```

#### 5. Start Development Servers
```bash
# Terminal 1 - Backend (http://localhost:3001)
cd backend
npm run dev

# Terminal 2 - Frontend (http://localhost:5173)
cd frontend
npm run dev
```

#### 6. Access the Application
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001/api
- **API Docs (Swagger)**: http://localhost:3001/api/docs
- **Prisma Studio**: `cd backend && npm run prisma:studio`

### Default Test Accounts
| Email | Password | Role |
|-------|----------|------|
| admin@securewatch.io | SecureWatch123! | ADMIN |
| analyst@securewatch.io | SecureWatch123! | ANALYST |
| viewer@securewatch.io | SecureWatch123! | VIEWER |

---

## Docker (Production Build)

```bash
# Build and run all services
docker compose up --build

# Or run individual services
docker compose up postgres -d
docker compose up backend -d
docker compose up frontend -d
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/change-password` | Change password (authed) |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh access token |

### Threats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/threats` | List threats (paginated, filterable) |
| POST | `/api/threats` | Create threat |
| GET | `/api/threats/:id` | Get threat details |
| PUT | `/api/threats/:id` | Update threat |
| DELETE | `/api/threats/:id` | Delete threat |

### Incidents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incidents` | List incidents |
| POST | `/api/incidents` | Create incident |
| GET | `/api/incidents/:id` | Get incident details |
| PUT | `/api/incidents/:id` | Update incident |
| DELETE | `/api/incidents/:id` | Delete incident |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| POST | `/api/users` | Create user |
| GET | `/api/users/:id` | Get user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Disable user |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/analytics/threats-by-month` | Threats by month |
| GET | `/api/analytics/severity-distribution` | Severity breakdown |
| GET | `/api/analytics/attack-types` | Attack types |
| GET | `/api/analytics/resolution-time` | Resolution metrics |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| PUT | `/api/notifications/:id/read` | Mark one as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| GET | `/api/notifications/unread-count` | Unread count |

### Audit Logs (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit-logs` | List audit logs |

### Threat Intelligence
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/threat-intel/search/ip/:ip` | Search IP reputation |
| GET | `/api/threat-intel/search/domain/:domain` | Search domain |
| GET | `/api/threat-intel/feeds` | List threat feeds |
| POST | `/api/threat-intel/feeds` | Add feed entry |
| DELETE | `/api/threat-intel/feeds/:id` | Remove feed |

---

## Running Tests

```bash
cd backend
npm test
```

Tests use Jest + Supertest with an isolated test environment.

---

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy the dist/ folder to Vercel
# Set VITE_API_URL to your backend URL
```

### Backend (Render / Railway)
```bash
cd backend
npm run build
# Deploy the dist/ folder
# Set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET environment variables
```

### Database (Managed PostgreSQL)
Use any managed PostgreSQL provider:
- Render PostgreSQL
- Railway PostgreSQL
- Supabase
- AWS RDS
- Neon.tech

---

## Project Structure

```
securewatch/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Sample data seeder
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── services/           # Business logic
│   │   ├── repositories/       # Data access layer
│   │   ├── middlewares/        # Auth, validation, security
│   │   ├── routes/             # Express routers
│   │   ├── validators/         # Zod schemas
│   │   ├── websocket/          # Socket.IO setup
│   │   ├── utils/              # Helpers, errors, logger
│   │   ├── types/              # TypeScript interfaces
│   │   ├── app.ts              # Express app setup
│   │   ├── server.ts           # Entry point
│   │   └── swagger.ts          # API documentation
│   ├── tests/                  # Jest test files
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # ShadCN UI primitives
│   │   │   ├── layout/         # Sidebar, Topbar, layouts
│   │   │   └── shared/         # DataTable, StatCard, etc.
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, etc.
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── threats/        # Threat management
│   │   │   ├── incidents/      # Incident management
│   │   │   ├── analytics/      # Analytics charts
│   │   │   ├── users/          # User management
│   │   │   ├── audit-logs/     # Audit trail
│   │   │   ├── notifications/  # Notification center
│   │   │   ├── threat-intel/   # Threat intelligence
│   │   │   ├── settings/       # User settings
│   │   │   └── profile/        # User profile
│   │   ├── contexts/           # React contexts
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API service functions
│   │   ├── lib/                # Axios, Socket, utils
│   │   └── types/              # TypeScript types
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── docker-compose.yml
└── README.md
```

---

## Security Features

- **Helmet** - HTTP security headers
- **CORS** - Cross-origin resource sharing control
- **Rate Limiting** - Brute force protection (5 req/15min for auth)
- **JWT** - Short-lived access tokens (15min) + refresh tokens (7d)
- **Bcrypt** - Password hashing with salt rounds
- **Input Validation** - Zod schema validation on all endpoints
- **Input Sanitization** - XSS prevention via HTML stripping
- **CSRF** - Token-based cross-site request forgery protection
- **Secure Cookies** - HTTP-only, same-site strict
- **SQL Injection** - Prevented via Prisma parameterized queries

---

## License

MIT

---

## Author

Built with care for cybersecurity professionals. A portfolio-ready enterprise SaaS application.
