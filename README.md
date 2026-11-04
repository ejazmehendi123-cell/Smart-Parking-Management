# SmartPark — Smart Parking Reservation, Management & Billing System

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21_LTS-orange.svg?logo=openjdk)](https://openjdk.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18.6-blue.svg?logo=postgresql)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg?logo=vite)](https://vitejs.dev/)
[![JUnit 5](https://img.shields.io/badge/Tests-23%20Passed-success.svg)](file:///c:/Projects/Smart%20Parking%20System/docs/TESTING.md)

A complete, production-grade automated parking reservation, boom barrier QR gate check-in, real-time fee calculation, and billing system built with **Spring Boot 3 (Java 21)**, **PostgreSQL 18**, and **React 19 + TypeScript (Vite)**.

---

## 🌟 Key Features & Capabilities

1. **Interactive Visual Parking Facility Map**: Real-time 2D floor plans with status indicators (*Available*, *Occupied*, *Reserved*, *Maintenance*) and filters for Car, Motorcycle, EV Chargers, and Accessible bays.
2. **Digital Pass with High-Resolution QR Codes**: Generates cryptographic QR tokens for touchless gate boom-barrier entry.
3. **Automated Gate Scanner & Operator Console**: Fast camera / barcode / token authorization, walk-in entry, and parked vehicle live status tracking.
4. **Deterministic Billing Engine**: Strictly enforces **₹50 for every 3-hour block or fraction thereof** ($\text{fee} = 50 \times \lceil\text{duration\_seconds} / 10800\rceil$) computed with `BigDecimal`.
5. **Live Session Cost Ticker**: Animated elapsed timer and real-time accumulating cost calculator for active parked vehicles.
6. **Simulated Payment Gateway & Tax Invoices**: 1-click instant approval for UPI, Card, and Cash with official printable tax receipts.
7. **Executive Analytics & Occupancy Dashboard**: Visual gauges for live occupancy, revenue by payment channel, revenue by facility, and peak utilization hours.
8. **User Governance & Audit Trail**: Comprehensive administrative logs tracking actors, actions, and timestamps.
9. **Defensive Programming & Jakarta Bean Validation**: Enforces vehicle registration regex patterns, non-null slot IDs, future timestamps, and global `@RestControllerAdvice`.

---

## 🚀 Quick Access & Live URLs

| Service | URL | Description |
| :--- | :--- | :--- |
| **Web Application** | [http://localhost:5173](http://localhost:5173) *(or 5174)* | Modern Dark Glassmorphic React Application |
| **REST API Base** | [http://localhost:8080/api](http://localhost:8080/api) | Spring Boot REST Endpoints |
| **Interactive Swagger UI** | [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) | OpenAPI 3.0 Interactive Explorer |
| **Actuator Health Check** | [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health) | System Liveness & Database Health |

---

## 🔑 Login Credentials

The system includes pre-configured demo accounts for all roles **1-click login toggles** in the UI, as well as your personal user account:

| Role | Email | Password | Pre-Registered Vehicle | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **User (Customer)** | `ejazmehendi123@gmail.com` | `Ejaz@123` | `KA-05-EM-2026` (Car) | **Primary user account** (Quick-fill chip on login screen) |
| **Customer Demo** | `customer@smartpark.com` | `Customer@123` | `KA-01-MJ-1234` (Car) | Reserve bays, view QR passes, live ticker, checkout |
| **Gate Operator** | `operator@smartpark.com` | `Operator@123` | — | Scan gate QR codes, record entries, checkout vehicles |
| **Administrator** | `admin@smartpark.com` | `Admin@123` | — | Full access: Analytics, slot inventory, users, audit logs |

---

## 💻 Prerequisites

Ensure the following runtimes and services are installed:

| Tool | Required Version | Verification Command |
| :--- | :--- | :--- |
| **Java JDK** | Java 21 LTS | `java -version` |
| **Node.js & npm** | Node 18+ (tested on v24) | `node -v` and `npm -v` |
| **PostgreSQL** | PostgreSQL 16+ (tested on 18) | `psql --version` |

> [!NOTE]
> PostgreSQL service must be running on port `5432`. Default database is `smartpark_db` with user `postgres` and password `postgres`.

---

## 🛠️ How to Run the Project

### Method 1: Automated 1-Click Scripts (Recommended)

Open a **PowerShell** window in the project root: `c:\Projects\Smart Parking System`

```powershell
# 1. First-time setup (verifies prerequisites, compiles backend & frontend)
.\scripts\setup.ps1

# 2. Start both backend and frontend servers
.\scripts\start.ps1

# 3. Stop running services when finished
.\scripts\stop.ps1
```

---

### Method 2: Manual Terminal Execution

If you prefer running backend and frontend in dedicated terminal tabs:

#### Step 1: Ensure PostgreSQL Database is Ready
In PostgreSQL:
```sql
CREATE DATABASE smartpark_db;
```
*(Flyway will automatically create and seed all 11 tables on backend startup).*

#### Step 2: Start Spring Boot Backend
Open a terminal in `backend/`:
```powershell
cd "c:\Projects\Smart Parking System\backend"
.\mvnw.cmd spring-boot:run
```
* Backend boots on: `http://localhost:8080`
* Swagger UI available at: `http://localhost:8080/swagger-ui/index.html`

#### Step 3: Start React Vite Frontend
Open a second terminal in `frontend/`:
```powershell
cd "c:\Projects\Smart Parking System\frontend"
npm install    # only needed on first run
npm run dev
```
* Frontend boots on: `http://localhost:5173` *(or `http://localhost:5174`)*
* Open your browser at the displayed URL.

---

## 🧪 Running Unit Tests & Verification

The test suite validates pricing edge cases, booking conflict prevention, parking lifecycle, and payment settlement.

To run all **23 tests**:
```powershell
# Via PowerShell automation script:
.\scripts\test.ps1

# Or directly in the backend folder:
cd backend
.\mvnw.cmd test
```

### Verified Test Cases Breakdown:
* **Pricing Engine** ([`PricingServiceTest.java`](file:///c:/Projects/Smart%20Parking%20System/backend/src/test/java/com/smartpark/service/PricingServiceTest.java)):
  * `0 seconds` (identical entry/exit) $\rightarrow$ ₹0.00
  * `exit < entry` (negative duration) $\rightarrow$ `BadRequestException`
  * `null` timestamps $\rightarrow$ `BadRequestException`
  * **Assignment Example 1: 2 hours 15 mins** $\rightarrow$ **₹50.00**
  * **Assignment Example 2: 3 hours 5 mins** $\rightarrow$ **₹100.00**
  * `1 hour` (partial first block) $\rightarrow$ ₹50.00
  * `3 hours exact` $\rightarrow$ ₹50.00
  * `3 hours 1 min` (ceil to block 2) $\rightarrow$ ₹100.00
  * `6 hours exact` $\rightarrow$ ₹100.00
  * `6 hours 1 min` (ceil to block 3) $\rightarrow$ ₹150.00
  * Duration formatting string output verification
* **Booking Workflows** ([`BookingServiceTest.java`](file:///c:/Projects/Smart%20Parking%20System/backend/src/test/java/com/smartpark/service/BookingServiceTest.java)): Overlap rejection, vehicle compatibility, ownership verification.
* **Parking Operations** ([`ParkingServiceTest.java`](file:///c:/Projects/Smart%20Parking%20System/backend/src/test/java/com/smartpark/service/ParkingServiceTest.java)): Duplicate session guard, slot maintenance check, checkout and slot release.
* **Payment Settlement** ([`PaymentServiceTest.java`](file:///c:/Projects/Smart%20Parking%20System/backend/src/test/java/com/smartpark/service/PaymentServiceTest.java)): Payment processing, transaction reference generation, duplicate payment prevention.

---

## 📐 Deterministic Fee Formula

$$\text{fee} = 50.00 \times \left\lceil \frac{\text{duration\_seconds}}{10800} \right\rceil$$

* Calculated with high precision using `java.math.BigDecimal`
* Zero duration = ₹0.00
* 1s to 3 hours = ₹50.00
* 3h 1s to 6 hours = ₹100.00
* 6h 1s to 9 hours = ₹150.00

---

## 🌐 Core API Endpoints

| Category | Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Register new customer account |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| **Auth** | `GET` | `/api/auth/me` | User | Get current profile |
| **Slots** | `GET` | `/api/slots/available` | Public | Real-time available parking slots |
| **Slots** | `GET` | `/api/slots/occupied` | Public | Active occupied slots records |
| **Slots** | `GET` | `/api/slots` | Public | Filter slots by location/type/status |
| **Pricing** | `GET` | `/api/pricing/fare-by-minutes` | Public | Accrued fare calculation by minutes |
| **Pricing** | `GET` | `/api/pricing/calculate` | Public | Accrued fare calculation by timestamps |
| **Pricing** | `GET` | `/api/pricing/rules` | Public | Official rate and formula specification |
| **Bookings**| `POST` | `/api/bookings` | User | Reserve slot with date/time range |
| **Bookings**| `GET` | `/api/bookings/{id}/ticket` | User | Scannable digital QR boarding pass |
| **Parking** | `POST` | `/api/parking/entry` | Operator | Gate entry (by vehicle ID or number) |
| **Parking** | `POST` | `/api/parking/verify-qr` | Operator | Gate boom barrier QR scanner entry |
| **Parking** | `GET` | `/api/parking/active` | Operator | Live parked vehicles and active sessions |
| **Parking** | `GET` | `/api/parking/{id}/estimate` | User/Operator| Real-time accumulating cost estimate |
| **Parking** | `POST` | `/api/parking/{id}/checkout` | Operator | Process vehicle exit, final bill & free slot |
| **Payments**| `POST` | `/api/payments` | User/Operator| Settle bill (UPI, Card, Cash) |
| **Reports** | `GET` | `/api/reports/revenue` | Public/Admin | Aggregate revenue report on specified date |
| **Reports** | `GET` | `/api/reports/dashboard` | Admin | Executive analytics & occupancy gauges |

---

## 📋 End-to-End Walkthrough Demonstration

1. **Sign In**:
   - Open [http://localhost:5173](http://localhost:5173) (or `5174`).
   - Click the quick-fill chip **`ejazmehendi123@gmail.com`** or click the **Customer** demo button.
2. **Reserve a Bay**:
   - Select an available green bay on the 2D visual map (e.g. `Bay A-101`).
   - Choose vehicle `KA-05-EM-2026`, choose arrival/departure times, and click **Confirm Reservation**.
   - A digital ticket pops up with a scannable SVG QR code and booking reference `SP-XXXX`.
3. **Gate Boom Barrier Check-in**:
   - In the modal, click **Simulate Gate Check-In** (or switch to **Operator** mode and scan the QR token).
   - Boom barrier opens, the slot transitions atomically to **OCCUPIED**, and the **Live Session Tracker** activates.
4. **Live Elapsed Cost Ticker**:
   - Under the **Parked Session** tab, view the real-time clock and live cost accumulating at ₹50 per 3-hour interval.
5. **Exit & Checkout**:
   - Click **End Session & Pay**.
   - Choose your simulated payment channel (**UPI QR**, **Credit/Debit Card**, or **Cash**).
   - Click **Confirm & Pay** to simulate instant gateway clearance with a confetti celebration.
   - An official printable **Tax Receipt** is rendered with transaction ID `TXN-XXXX`.
6. **Executive Analytics**:
   - Switch to the **Admin** role via the navbar.
   - View live facility occupancy gauges, revenue breakdown by payment method, and immutable audit logs.

---

## 📁 Repository Structure

```
Smart Parking System/
├── backend/                  # Spring Boot 3 + Java 21 REST API
│   ├── src/main/java/        # Clean modular architecture
│   │   ├── config/           # SecurityConfig (flexible CORS), OpenApiConfig
│   │   ├── controller/       # Auth, Slot, Pricing, Booking, Parking, Payment, Report
│   │   ├── dto/              # Request & Response DTOs with Jakarta Bean Validation
│   │   ├── entity/           # JPA Entities (User, Slot, Booking, Session, Payment, etc.)
│   │   ├── exception/        # GlobalExceptionHandler (@RestControllerAdvice), custom exceptions
│   │   ├── mapper/           # Entity-to-DTO mappers
│   │   ├── repository/       # Spring Data JPA repositories with custom queries
│   │   └── service/          # Business logic & pricing engine (₹50/3hr ceiling formula)
│   ├── src/main/resources/   # application.yml, Flyway migrations (V1 schema, V2 seed)
│   └── src/test/java/        # JUnit 5 & Mockito test suite (23 passing tests)
├── frontend/                 # React 19 + TypeScript + Vite 8
│   ├── src/components/       # SlotMap, QrTicket, LiveSessionCard, PaymentModal, Receipts
│   ├── src/views/            # CustomerDashboard, AdminDashboard, AuthView
│   ├── src/context/          # AuthContext, ToastContext
│   └── src/index.css         # Modern Dark Glassmorphic Design System
├── database/                 # Standalone schema.sql and seed.sql
├── docs/                     # ARCHITECTURE.md, API_DOCUMENTATION.md, TESTING.md
├── postman/                  # Postman collection (SmartPark_Postman_Collection.json)
└── scripts/                  # setup.ps1, start.ps1, stop.ps1, test.ps1
```

---

## 📦 Submission Guidelines (Google Classroom — Deadline: 30 Oct 2026)

### Option A: Submitting via GitHub / GitLab Link
A local Git repository is initialized with all files committed. To link and push to your remote repository:
```powershell
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git
git branch -M main
git push -u origin main
```
Copy and submit the repository link in Google Classroom.

### Option B: Submitting as a Zipped Project Folder
The project includes a root `.gitignore` that excludes large build artifacts (`node_modules/`, `target/`).
Right-click the `Smart Parking System` folder $\rightarrow$ **Send to $\rightarrow$ Compressed (zipped) folder**, then upload the resulting `.zip` to Google Classroom.
