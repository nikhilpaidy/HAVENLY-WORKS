# AURA Coworking Platform — Backend API Service

Production-grade Modular Monolith Backend API built with Node.js, Express, TypeScript, and MongoDB.

## Architecture & Core Modules

The backend is organized into domain-driven feature modules under `src/modules/`:
- **auth**: JWT authentication (access + rotating refresh tokens), password hashing with bcrypt, session revocation.
- **super-admin**: Global oversight, coworking admin account provisioning, platform KPIs.
- **organizations**: Multi-tenant coworking organizations, address, branding, currencies, and settings.
- **locations**: Physical coworking branches with customized weekly operating hours, holidays, and closures.
- **rooms**: Meeting rooms, capacity, amenities, base rates, minimum/maximum duration, slot interval, buffer times, and maintenance blocks.
- **inventory**: Dedicated `InventorySlot` lock model with compound unique index `{ roomId: 1, slotTime: 1 }` ensuring a 100% mathematical zero-overlap guarantee.
- **companies**: Client tenant accounts, allowance configuration (`monthlyFreeHours`, `additionalHourlyRate`, `currency`).
- **company-members**: Role-based access control (`COMPANY_OWNER`, `COMPANY_BOOKING_MANAGER`, `EMPLOYEE`).
- **allowances**: Auditable Free-Hour Entitlement Engine. Tracks granted, reserved, consumed, and released hours with immutable ledger entries.
- **bookings**: Atomic reservation engine preventing race conditions and double bookings. Includes check-in and cancellation workflows.
- **availability**: Real-time slot-by-slot room calendar availability calculator factoring in operating hours, reservations, and maintenance blocks.
- **billing**: Invoices, billing statements for overage hours, line item generation, payment statuses.
- **payments**: Internal accounting records for manually received payments (bank transfers, cash, cheques) with verification audit trails.
- **reports**: MongoDB Aggregation Pipelines computing room utilization, company usage, and financial metrics.
- **blogs**: Content management system for Super Admin with public endpoints for published posts.
- **notifications**: In-app notification center backed by MongoDB.
- **audit-logs**: Immutable audit trails for privileged and administrative actions.
- **health**: Production liveness and database connection status probe.

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/coworking?retryWrites=true&w=majority"
JWT_ACCESS_SECRET="your_jwt_access_secret_min_32_chars"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_min_32_chars"
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN="http://localhost:3000,http://localhost:5174"
```

---

## Installation & Local Development

```bash
cd backend
npm install
```

### Seed Database
Populate database with sample Super Admin, Coworking Admin, Client Companies, Meeting Rooms, Allowances, Bookings, and Blog Posts:

```bash
npm run seed
```

**Default Seeded Credentials:**
- Super Admin: `superadmin@aura.io` / `Password@123`
- Coworking Admin: `admin@auraprime.com` / `Password@123`
- Client Owner (Nexus AI): `marcus.chen@nexusai.com` / `Password@123`
- Client Manager (Nexus AI): `sarah.jenkins@nexusai.com` / `Password@123`
- Client Employee (Nexus AI): `david.kim@nexusai.com` / `Password@123`
- Client Owner (Vanguard): `olivia.vance@vanguardcp.com` / `Password@123`

### Run Development Server
```bash
npm run dev
```
The server listens at `http://localhost:5000/api/v1`.

### Run Automated Tests
```bash
npm test
```
Runs:
- `tests/unit.test.ts`: date slot normalization and interval overlap math.
- `tests/integration.test.ts`: auth, public blogs, profile, and health endpoints.
- `tests/concurrency.test.ts`: high-concurrency race condition test firing 5 simultaneous bookings for the identical slot. Verifies exactly 1 succeeds and 4 receive 409 Conflict.

### Typecheck and Build
```bash
npm run lint
npm run build
npm start
```

---

## Docker Deployment

Build and run standalone container:

```bash
docker build -t aura-backend .
docker run -p 5000:5000 --env-file .env aura-backend
```
