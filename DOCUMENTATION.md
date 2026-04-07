# Demand Roadside Assistance | Kericho Hub

## 1. Project Overview
The On-Demand Roadside Assistance Platform is a comprehensive web-based emergency management system tailored for Driverss. It modernizes emergency roadside assistance by instantly connecting Driverss experiencing vehicle breakdowns with the nearest available service providers (towing, fuel delivery, mechanics, etc). The system leverages real-time geolocation mapping, automated dispatch logic, and strict administrative governance to drastically reduce response delays, optimize fleet efficiency, and guarantee a seamless transactional experience.

## 2. Technology Stack & Coding Languages
- **Core Framework:** Next.js 16+ (App Router framework powered by React 19 and Turbopack) & TypeScript
- **Styling UI/UX:** Vanilla CSS (custom-built global `.css` tokens focusing on modern Glassmorphism, dynamic gradients, CSS variables and interactive animations)
- **Database Architecture:** SQLite (Development)
- **ORM (Object-Relational Mapping):** Prisma Client v5.22
- **Icons & Assets:** `lucide-react`
- **Geolocation Tracking:** HTML5 Geolocation native API (`navigator.geolocation`)
- **State & Data Handling:** React Hooks (`useState`, `useEffect`, `useCallback`) and built-in Next.js Edge API routes.

## 3. Core Functionality & Modules

### 3.1 User Registration & Authentication
Secure onboarding process for both Driverss and service providers. It maintains distinct roles, including an automated administrative verification workflow (storing License Number and Vehicle Plate logs) to ensure compliance and security before permitting dispatch access.

### 3.2 Automated Location Detection
Leverages automated GPS location detection using native browser APIs. It provides highly accurate latitude/longitude coordinates and generates an immediate context string (e.g., bypass tracking), thereby removing the stress of manual communication from the user during distress situations.

### 3.3 Dynamic Service Request Handling
Driverss can specifically isolate their requested service:
- **TOWING:** Direct mechanical transport retrieval.
- **FUEL:** Specific dynamic drop-downs for Fuel Type (Unleaded/Diesel) and Amount (5L/10L).
- **MECHANIC:** Specialized diagnostics selection (Engine, Brakes, Suspension, Overheating).
- **TYRE & BATTERY:** Rapid turnaround roadside assistance options.
Users also provide a granular textual description of the emergency to assist providers prior to arrival.

### 3.4 Proximity Provider Matching
Replaces manual call centers with an automated matching and dispatch logic block. Service requests are securely recorded via Server Routes, fee structures are calculated instantly based on Haversine coordinate distance computation, and jobs are broadcasted to the network. The system operates on an organized PENDING/ACCEPTED status model allowing the designated or nearest available local supplier to secure and execute the operation.

### 3.5 Real-Time Tracking & ETA Engine
Driverss are provided with a dedicated, live dispatch matrix showing the physical state of their request. Time of Arrival (ETA) is algorithmically forecasted based on the distance algorithm combined with an assumed local traffic speed buffer (e.g., 40km/h), offering clear timeline visibility to the distressed driver.

### 3.6 Secure Digital Transactions & Wallets
Integrated base-fee and per-kilometer real-time calculation pipeline. This includes automated commission/tax extraction (10% administrative platform levy). Transactions are seamlessly updated as PAID or PENDING by the service providers upon job completion, effectively supporting both digital and cash-in-hand workflows while managing the Provider's virtual Net Revenue Wallet.

### 3.7 Quality Control Rating System
Post-completion, the dispatch matrix automatically triggers a review layer. It prompts the Drivers to submit a 1 to 5-star rating for the service provider securely persisted within the database via REST mechanisms. This strictly enforces quality of service operations and encourages healthy supplier dynamics.

## 4. Administrative Governance
The platform includes an advanced **Admin Core Hub (`/admin/dashboard`)** constructed for platform operators:
- Real-time deep-level system network tracking out of all active requests.
- Authorization mechanism to manually approve/suspend newly registered service providers ensuring high trust protocol.
- Macro revenue metric calculations summarizing total Platform Net Volume versus earned Total Commission.
- Comprehensive transparent audit logs of all suppliers active within the territory.

## 5. Software Development Lifecycle (Agile SDLC)
The application has successfully traversed Requirements Analysis and System Design. 
- **Phase 1:** Setup of SQLite schema with user relations and API endpoint foundations.
- **Phase 2 & 3:** Developed the High-Fidelity Drivers tracking portal and Supplier acceptance pipeline.
- **Phase 4:** Functional verification with integrated geo-data math, financial wallet simulation, and automated system synchronization workflows.

## 6. How to Run Locally

Ensure you have `Node.js v20+` and `npm` installed.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Sync your local Prisma Schema:**
   ```bash
   npx prisma db push
   # OR
   npx prisma generate
   ```

3. **Boot the standard Next.js development server:**
   ```bash
   npm run dev
   ```

4. Access the primary web portals at `http://localhost:3000`:
   - Authentication Interface (`/login` or `/register`)
   - User Drivers Portal (`/user/dashboard`)
   - Supplier Fleet Portal (`/provider/dashboard`)
   - Platform Administration Core (`/admin/dashboard`)
