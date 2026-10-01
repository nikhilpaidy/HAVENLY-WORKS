# AURA Coworking Platform — Public Marketing Website

Premium commercial marketing website built with React 18, TypeScript, Vite, and Tailwind CSS.

## Visual Identity & Design System

- **Architectural Aesthetic**: Deep midnight tones (`#090D16`), warm ivory surfaces (`#FAF7F2`), muted champagne brass accents (`#C5A880`), subtle frosted glass overlays.
- **Theme Switcher**: Instant light and dark mode toggle with persistent local storage retention.
- **Live Scheduling Simulator**: Interactive room schedule visualizer simulating 30-min normalized time intervals and real-time allowance calculations.
- **Dynamic Content**: Fetches published blog articles directly from the backend MongoDB API (`/api/v1/blogs`).

---

## Pages Included

1. **Home (`/`)**: Hero section, interactive schedule simulator, core architectural pillars, owner/company benefits, live blog highlights from backend, and call to action.
2. **Features (`/features`)**: Comprehensive feature matrix covering atomic locks, allowances, locations, billing, notifications, and security.
3. **How It Works (`/how-it-works`)**: Step-by-step workflow guide from facility configuration to atomic quota reservation and invoice reconciliation.
4. **For Coworking Owners (`/for-owners`)**: Operational value proposition, multi-location governance, and manual payment tracking.
5. **For Companies (`/for-companies`)**: Tenant team empowerment, free-hour balance transparency, and frictionless boardroom bookings.
6. **Meeting Rooms (`/meeting-rooms`)**: Executive boardroom showcase with amenities, hardware equipment, and capacity metrics.
7. **Pricing (`/pricing`)**: Transparent SaaS plans for coworking operators (Starter, Professional, Enterprise) and explanation of the client free-hour allowance model.
8. **Blog Listing (`/blog`)**: Real-time articles fetched from backend with category and keyword search filters.
9. **Blog Article Detail (`/blog/:slug`)**: Full article view with author metadata, reading time, published date, and rich content.
10. **About (`/about`)**: Architectural mission, company values, and platform vision.
11. **Contact (`/contact`)**: Interactive consultation inquiry form with validation and corporate coordinates.
12. **Privacy Policy (`/privacy`)**: Tenant data scoping, password hashing standards, and privacy commitments.
13. **Terms of Service (`/terms`)**: Service level commitments, reservation exclusivity, and billing rules.
14. **Login Gateway (`/login`)**: Direct role selector guiding users to Super Admin, Coworking Admin, or Client portal login experiences.

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=http://localhost:6018/api/v1
VITE_PORTAL_URL=http://localhost:5174
```

---

## Installation & Local Development

```bash
cd website
npm install
npm run dev
```

The website runs at `http://localhost:3000`.

### Typecheck and Build
```bash
npm run lint
npm run build
npm run preview
```

---

## Docker Deployment

```bash
docker build -t aura-website .
docker run -p 3000:80 aura-website
```
