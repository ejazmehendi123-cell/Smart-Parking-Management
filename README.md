# SmartPark — Smart Parking Reservation, Management & Billing System

A complete, production-grade automated parking reservation, gate check-in, real-time fee calculation, and billing system built with **Spring Boot 3 (Java 21)**, **PostgreSQL 18**, and **React 19 + TypeScript (Vite)**.

---

## 🌟 Key Features

1. **Interactive Visual Parking Facility Map**: Real-time 2D floor plans with status indicators (Available, Occupied, Reserved, Maintenance) and filters for Car, Motorcycle, EV Chargers, and Accessible bays.
2. **Digital Pass with High-Resolution QR Codes**: Generates cryptographic QR tokens for touchless gate boom-barrier entry.
3. **Automated Gate Scanner & Operator Console**: Fast camera / barcode / token authorization, walk-in entry, and parked vehicle live status tracking.
4. **Deterministic Billing Engine**: Strictly enforces **₹50 for every 3-hour block or fraction thereof** ($\text{fee} = 50 \times \lceil\text{duration\_seconds} / 10800\rceil$) computed with `BigDecimal`.
5. **Live Session Cost Ticker**: Animated elapsed timer and real-time accumulating cost calculator for active parked vehicles.
6. **Simulated Payment Gateway & Tax Invoices**: 1-click instant approval for UPI, Card, and Cash with official printable tax receipts.
7. **Executive Analytics & Occupancy Dashboard**: Visual gauges for live occupancy, revenue by payment channel, revenue by facility, and peak utilization hours.
8. **User Governance & Audit Trail**: Comprehensive administrative logs tracking actors, actions, and timestamps.

---

## 🚀 Quick Access & Live URLs

| Service | URL | Description |
| :--- | :--- | :--- |
| **Web Application** | [http://localhost:5173](http://localhost:5173) | Modern Dark Glassmorphic React Application |
| **REST API Base** | [http://localhost:8080/api](http://localhost:8080/api) | Spring Boot REST Endpoints |
| **Interactive Swagger UI** | [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) | OpenAPI 3.0 Interactive Explorer |
| **Actuator Health Check** | [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health) | System Liveness & Database Health |

---

## 🔑 Pre-Seeded Demo Credentials

The system includes pre-configured demo accounts for all roles with 1-click login toggles in the UI:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@smartpark.com` | `Customer@123` | Reserve slots, view passes, track live sessions, pay fees |
| **Gate Operator** | `operator@smartpark.com` | `Operator@123` | Scan gate QR codes, record entries, checkout parked cars |
| **Administrator** | `admin@smartpark.com` | `Admin@123` | Full access: Analytics, slot inventory, users, audit logs |

---

## 🛠️ Automated PowerShell Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **Setup** | `.\scripts\setup.ps1` | Checks prerequisites, creates PostgreSQL DB, compiles backend & frontend |
| **Start** | `.\scripts\start.ps1` | Launches Spring Boot backend (8080) and Vite frontend (5173) |
| **Stop** | `.\scripts\stop.ps1` | Gracefully terminates backend and frontend processes |
| **Test** | `.\scripts\test.ps1` | Executes all 20 backend unit tests and validates frontend production bundle |

---

## 📋 End-to-End Demonstration Walkthrough

Follow these steps to demonstrate the full application workflow:

### Step 1: Customer Reservation
1. Open [http://localhost:5173](http://localhost:5173).
2. Click the **Customer** 1-click demo login button.
3. On the **Live Parking Map**, select an available green slot (e.g. `Bay A-101`).
4. Select your vehicle (`KA-01-MJ-1234`), choose your arrival and departure times, and click **Confirm Reservation**.
5. The digital pass modal will open displaying a scannable QR code and unique reference (e.g. `SP-XXXX`).

### Step 2: Gate Check-in
1. In the digital pass modal, click **Simulate Gate Check-In** (or switch to **Operator** mode and paste the QR token into the Gate Scanner).
2. The gate barrier opens, the slot atomically transitions to **OCCUPIED**, and the **Parked Session** tracker activates.

### Step 3: Live Billing & Elapsed Timer
1. Under the **Parked Session** tab, observe the live animated clock and the real-time billing accumulator ticking at ₹50 per 3-hour interval.

### Step 4: Checkout & Payment Settlement
1. Click **End Session & Pay**.
2. Review the checkout summary and select a simulated payment method (**UPI QR**, **Card**, or **Cash**).
3. Click **Confirm & Pay** to simulate instant gateway clearance and confetti celebration.
4. An official printable **Tax Receipt** is generated with transaction reference `TXN-XXXX`. Click **Print Receipt** or **Done**.

### Step 5: Admin & Operator Analytics
1. In the top navbar, switch to the **Admin** role.
2. Navigate to **Facility Analytics & Revenue** to inspect real-time occupancy gauges, daily income, and payment method breakdowns.
3. Check the **User Governance & Audit Trail** tab to view the immutable event log.

---

## 📐 Deterministic Fee Formula

$$\text{fee} = 50.00 \times \left\lceil \frac{\text{duration\_seconds}}{10800} \right\rceil$$

- Calculated using `java.math.BigDecimal`
- Zero duration (same entry and exit timestamp) = ₹0.00
- 1s to 3 hours = ₹50.00
- 3h 1s to 6 hours = ₹100.00
- 6h 1s to 9 hours = ₹150.00

---

## 📁 Repository Structure

```
Smart Parking System/
├── backend/                  # Spring Boot 3 + Java 21 REST API
│   ├── src/main/java/        # Entities, DTOs, Controllers, Services, Security, Scheduler
│   ├── src/main/resources/   # application.yml, Flyway migrations (V1 schema, V2 seed)
│   └── src/test/java/        # JUnit 5 & Mockito test suite (20 tests)
├── frontend/                 # React 19 + TypeScript + Vite 8
│   ├── src/components/       # SlotMap, QrTicket, LiveSessionCard, PaymentModal, Receipts
│   ├── src/views/            # CustomerDashboard, AdminDashboard, AuthView
│   ├── src/context/          # AuthContext, ToastContext
│   └── src/index.css         # Modern Dark Glassmorphic Design System
├── database/                 # Standalone schema.sql and seed.sql
├── docs/                     # ARCHITECTURE.md, API_DOCUMENTATION.md, TESTING.md
├── postman/                  # Postman collection with all pre-configured endpoints
└── scripts/                  # setup.ps1, start.ps1, stop.ps1, test.ps1
```
