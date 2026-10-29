# SmartPark — REST API Documentation

Base URL: `http://localhost:8080/api`  
Swagger UI Interactive Documentation: `http://localhost:8080/swagger-ui/index.html`  
OpenAPI JSON Spec: `http://localhost:8080/api-docs`

---

## 1. Authentication (`/api/auth`)

### Register New User
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password@123"
}
```
- **Response** (`201 Created`):
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "user": {
    "id": 5,
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "role": "CUSTOMER",
    "accountStatus": "ACTIVE",
    "createdAt": "2026-10-25T16:30:00"
  }
}
```

### User Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@smartpark.com",
  "password": "Admin@123"
}
```
- **Response** (`200 OK`): Auth response with JWT token.

### Get Current Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated (`Bearer <token>`)

---

## 2. Locations & Parking Slots (`/api/locations`, `/api/slots`)

### Get Locations
- **Endpoint**: `GET /api/locations`
- **Access**: Public
- **Response**: Array of locations with `totalSlots` and `availableSlots`.

### Get Available Slots
- **Endpoint**: `GET /api/slots/available`
- **Access**: Public
- **Query Parameters**:
  - `locationId` (optional, long): Filter by facility location ID.
  - `type` (optional, string): `CAR`, `MOTORCYCLE`, `EV`, `ACCESSIBLE`.

### Get Occupied Slots (Active Records)
- **Endpoint**: `GET /api/slots/occupied`
- **Access**: Public
- **Query Parameters**:
  - `locationId` (optional, long): Filter by facility location ID.
  - `type` (optional, string): `CAR`, `MOTORCYCLE`, `EV`, `ACCESSIBLE`.
- **Response**: Array of currently occupied parking slots.

### Create Parking Slot
- **Endpoint**: `POST /api/slots`
- **Access**: `ROLE_ADMIN`
- **Request Body**:
```json
{
  "locationId": 1,
  "slotNumber": "A-109",
  "slotType": "EV",
  "floor": "Ground",
  "description": "Fast charger bay"
}
```

### Update Slot Status / Maintenance
- **Endpoint**: `PATCH /api/slots/{id}`
- **Access**: `ROLE_ADMIN` or `ROLE_OPERATOR`
- **Request Body**:
```json
{
  "status": "MAINTENANCE"
}
```

---

## 3. Vehicles (`/api/vehicles`)

### Get My Vehicles
- **Endpoint**: `GET /api/vehicles`
- **Access**: Authenticated

### Register Vehicle
- **Endpoint**: `POST /api/vehicles`
- **Request Body**:
```json
{
  "registrationNumber": "KA-01-MJ-9999",
  "vehicleType": "CAR"
}
```

---

## 4. Bookings & Digital Passes (`/api/bookings`)

### Create Reservation
- **Endpoint**: `POST /api/bookings`
- **Access**: Authenticated
- **Request Body**:
```json
{
  "vehicleId": 1,
  "slotId": 2,
  "startTime": "2026-10-25T17:00:00",
  "endTime": "2026-10-25T19:00:00"
}
```
- **Response** (`201 Created`):
```json
{
  "id": 1,
  "bookingReference": "SP-25970904",
  "qrToken": "Hxdmyh5L10BkmU6w99rCZqvhCcoGs2AMFonE_9O2cRc",
  "slotNumber": "A-102",
  "status": "CONFIRMED"
}
```

### Cancel Booking
- **Endpoint**: `POST /api/bookings/{id}/cancel`
- **Access**: Booking Owner or Admin

---

## 5. Gate Operations & Parking (`/api/parking`)

### Verify QR Token at Gate Entry
- **Endpoint**: `POST /api/parking/verify-qr`
- **Access**: `ROLE_OPERATOR` or `ROLE_ADMIN`
- **Request Body**:
```json
{
  "qrToken": "Hxdmyh5L10BkmU6w99rCZqvhCcoGs2AMFonE_9O2cRc"
}
```
- **Response** (`201 Created`): Active parking session object.

### Active Sessions
- **Endpoint**: `GET /api/parking/active`
- **Access**: `ROLE_OPERATOR` or `ROLE_ADMIN`

### Real-time Fee Estimate
- **Endpoint**: `GET /api/parking/{id}/estimate`
- **Access**: Session Owner or Operator/Admin

### Gate Checkout
- **Endpoint**: `POST /api/parking/{id}/checkout`
- **Access**: `ROLE_OPERATOR` or `ROLE_ADMIN`
- **Response** (`200 OK`): Completed parking session with final `totalBill` in rupees.

---

## 6. Payments & Receipts (`/api/payments`)

### Settle Payment
- **Endpoint**: `POST /api/payments`
- **Access**: Session Owner or Admin
- **Request Body**:
```json
{
  "sessionId": 1,
  "method": "UPI"
}
```
- **Response** (`201 Created`): Payment receipt with `transactionReference` (`TXN-XXXX`) and `PAID` status.

---

## 7. Analytics & Reports (`/api/reports`)

### Dashboard Metrics
- **Endpoint**: `GET /api/reports/dashboard`
- **Access**: `ROLE_OPERATOR` or `ROLE_ADMIN`

### Occupancy Breakdown
- **Endpoint**: `GET /api/reports/occupancy`

### Revenue Report
- **Endpoint**: `GET /api/reports/revenue`
- **Access**: Public for single date lookup, Admin/Operator for full analytics
- **Query Parameters**: `from`, `to`, or `date` (`YYYY-MM-DD`).
- **Example**: `GET /api/reports/revenue?date=2026-10-29`
- **Response**: Aggregated revenue, completed sessions count, and payment breakdown.

---

## 8. Pricing Engine & Real-Time Fare (`/api/pricing`)

### Real-Time Fare by Duration (Minutes)
- **Endpoint**: `GET /api/pricing/fare-by-minutes`
- **Access**: Public
- **Query Parameters**: `durationMinutes` (long)
- **Examples**:
  - `durationMinutes=135` (2h 15m) $\rightarrow$ **₹50.00**
  - `durationMinutes=185` (3h 5m) $\rightarrow$ **₹100.00**

### Real-Time Fare by Timestamps
- **Endpoint**: `GET /api/pricing/calculate`
- **Access**: Public
- **Query Parameters**:
  - `entryTime` (required, ISO datetime: `2026-10-25T10:00:00`)
  - `exitTime` (optional, ISO datetime; defaults to current time if omitted)

### Official Rate Structure & Formula
- **Endpoint**: `GET /api/pricing/rules`
- **Access**: Public
- **Deterministic Formula**: $\text{fee} = 50.00 \times \left\lceil \frac{\text{duration\_seconds}}{10800} \right\rceil$
