# AURA Coworking & Meeting Room Management Portal

Multi-tenant administrative and client web application for coworking space operators, physical facility managers, corporate client owners, and enterprise team members.

## Architecture

Built with:
- **Framework**: React 18, TypeScript (Strict Mode), Vite
- **Styling**: Tailwind CSS with custom glassmorphism design system (`#FAF7F2` warm alabaster light mode & `#090D16` obsidian slate dark mode)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Room utilization bar charts & quota consumption breakdown)
- **Routing**: React Router v7 with role-based route protection (`SUPER_ADMIN`, `COWORKING_ADMIN`, `COMPANY_OWNER`, `COMPANY_BOOKING_MANAGER`, `EMPLOYEE`)
- **API Communication**: Native fetch with typed API client and JWT bearer token authorization

## Role Portals & Routes

### 1. Super Admin Suite (`/super-admin/*`)
- `/super-admin/login`: Super admin gateway
- `/super-admin/dashboard`: Global multi-tenant metrics and financial overviews
- `/super-admin/admins`: Coworking operator onboarding and account status controls
- `/super-admin/organizations`: Coworking brand tenant registry
- `/super-admin/reports`: System-wide bookings volume and tenant adoption charts
- `/super-admin/blogs`: Public marketing CMS editor and publisher
- `/super-admin/audit-logs`: Immutable system security and operation event log

### 2. Coworking Admin Operator Portal (`/admin/*`)
- `/admin/login`: Operator access gateway
- `/admin/dashboard`: Hub operations center, today's schedule, KPI summary
- `/admin/locations`: Physical campus infrastructure, addresses, and operating hours
- `/admin/rooms`: Meeting room inventory, equipment amenities, buffer intervals, and maintenance downtime
- `/admin/companies`: Client company onboarding, monthly free-hour quotas, overage rate config, and team members
- `/admin/bookings`: Master reservation schedule, check-in verification, cancellation, and scheduling on behalf
- `/admin/billing`: Monthly overage statement generation, manual payment recording (ACH, cash, corporate check, POS card), and payment audit verification
- `/admin/reports`: Room utilization analytics and free allowance vs overage ratios

### 3. Corporate Client Portal (`/client/*`)
- `/client/login`: Enterprise tenant member gateway
- `/client/dashboard`: Free hours monthly quota tracker, upcoming meetings, balance due alert
- `/client/rooms`: Room catalog with live date and slot availability inspection and interactive reservation modal with quota impact preview
- `/client/bookings`: Upcoming and past meeting reservations with instant cancellation and quota refunding
- `/client/allowance`: Double-entry accounting ledger of all quota grants, reservations, releases, and consumptions
- `/client/invoices`: Monthly statements with line-item breakdowns and remittance instructions
- `/client/profile`: Member credentials, corporate quota specs, and operator hub info

## Seeded Test Accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@aura.io` | `Password@123` |
| Coworking Admin | `admin@auraprime.com` | `Password@123` |
| Client Company Owner | `marcus.chen@nexusai.com` | `Password@123` |

## Getting Started

### Prerequisites
Node.js 18+ and running AURA Backend at `http://localhost:5000`

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
# Portal starts at http://localhost:5174
```

### Production Build
```bash
npm run build
npm run preview
```

### Docker Deployment
```bash
docker build -t aura-portal .
docker run -p 5174:80 aura-portal
```
