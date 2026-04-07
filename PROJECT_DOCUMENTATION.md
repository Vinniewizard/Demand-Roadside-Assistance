# 🛸 Roadside Assistance Platform | Kericho County
## 📑 Complete Project Documentation

Welcome to the official documentation for the **On Demand Roadside Assistance Platform in Kericho County**. This platform is a high-fidelity, real-time emergency response system designed to connect stranded Drivers with certified rescue nodes (Suppliers) across the region.

---

## 🏗️ 1. System Architecture
The platform is built using a modern, type-safe stack optimized for rapid response and high availability.

- **Frontend**: Next.js 16 (App Router) with React 19.
- **Styling**: Vanilla CSS with a **Premium Glassmorphism** design system.
- **Backend APIs**: Next.js Serverless Functions (Route Handlers).
- **Database**: PostgreSQL (Production) / SQLite (Dev) managed via **Prisma ORM**.
- **Maps & Geolocation**: Leaflet.js with React-Leaflet and high-precision GPS integration.
- **Icons**: Lucide-React.

---

## 🔑 2. Core Functional Modules

### 🚘 A. Drivers (Motorist) Experience
- **Secure Dashboard**: A "Drivers Control" panel for launching missions.
- **Service Matrix**: One-tap selection for Towing, Fuel, Mechanical, Tyre, and Battery rescue.
- **Location Locking**: A mandatory **"Verify & Submit GPS"** step to ensure sub-meter accuracy before dispatch.
- **Live Radar**: Real-time tracking of assigned rescue nodes with pulse-animation markers.
- **Rescue History**: Persistent history of all past dispatches and missions.

### 🛠️ B. Supplier (Provider) Experience
- **Mission Console**: Interface to accept, track, and complete rescue missions.
- **GPS Navigation**: Real-time distance calculation via the Haversine formula.
- **Revenue Management**: Automated tracking of earnings and regional commissions.
- **Certified Status**: Strict requirement for "Approved" status before mission access is granted.

### 👮 C. Administrative Governance
- **Fleet Oversight**: Overview of all active dispatches across Kericho County.
- **Supplier Certification**: A dedicated portal to approve, suppress, or audit rescue providers.
- **Financial Analytics**: Tracking total transaction volume and platform commissions.

---

## 💾 3. Database Schema (Prisma)
The data layer is structured to handle high-concurrency dispatch events.

| Model | Description | Key Fields |
| :--- | :--- | :--- |
| **User** | Central identity for Drivers, Providers, and Admins. | roles, certification status, revenue, base fees. |
| **AssistanceRequest** | The core "Mission" entity. | GPS coords, status (PENDING, EN_ROUTE, etc.), fees. |
| **Transaction** | Financial record of completed missions. | amount, status, feedback / rating. |

### 🔒 Security Guards
1.  **Supplier Guard**: The API strictly verifies `isApproved: true` before allowing a supplier to accept a mission.
2.  **Location Guard**: Missions cannot be launched until the motorist "locks" their current GPS position.

---

## 🚀 4. Deployment & Maintenance
The system is configured for a **"Push-to-Deploy"** workflow on Render.

### Render Configuration
- **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `DATABASE_URL`: Your PostgreSQL connection string.
  - `PORT`: 10000 (standard for Render).

### Manual Maintenance
- **Prisma Studio**: Run `npx prisma studio` locally to manage data directly.
- **Schema Updates**: When changing the database structure, run `npx prisma db push` to sync your database.

---

## 🎨 5. Design System & UX
- **Aesthetic**: Dark-mode glassmorphism (`hsla(var(--glass-bg))`).
- **Typography**: Inter (Body) and Outfit (Headings).
- **Animations**: CSS-driven `fade-up`, `pulse-primary`, and Leaflet marker animations.
- **Responsiveness**: Flexible `clamp()` layouts to ensure the map looks perfect on mobile and desktop.

---

## 📜 6. Compliance & Certification
Every rescue node in this platform must be **Kericho Hub Certified**. This ensures that assistance is provided only by verified business owners with technical competence in roadside rescue.

---
*© 2026 Roadside Assistance Platform | Kericho County. All rights reserved.*
