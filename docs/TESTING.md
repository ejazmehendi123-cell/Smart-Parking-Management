# SmartPark — Testing Strategy & Test Verification Guide

## 1. Overview

SmartPark employs a rigorous multi-tier testing strategy covering business logic unit tests, concurrent slot race-condition handling, validation boundaries, and end-to-end integration workflows.

---

## 2. Test Execution Commands

### Running Backend Unit & Service Tests
```powershell
cd "c:\Projects\Smart Parking System\backend"
.\mvnw.cmd test
```

### Running Comprehensive Suite via Automation Script
```powershell
cd "c:\Projects\Smart Parking System"
.\scripts\test.ps1
```

---

## 3. Unit Test Suites

### 1. `PricingServiceTest`
Validates the mandatory ₹50 per 3-hour block deterministic formula:

| Test Case | Inputs | Expected Output | Status |
| :--- | :--- | :--- | :--- |
| Zero Duration | `entry == exit` | ₹0.00 | **PASSED** |
| Negative Duration | `exit < entry` | `BadRequestException` | **PASSED** |
| Null Timestamps | `entry == null` or `exit == null` | `BadRequestException` | **PASSED** |
| **Assignment Example 1** | **2 hours 15 mins** | **₹50.00** | **PASSED** |
| **Assignment Example 2** | **3 hours 5 mins** | **₹100.00** | **PASSED** |
| Partial First Block | 1 hour | ₹50.00 | **PASSED** |
| Exact First Block | 3 hours (10,800s) | ₹50.00 | **PASSED** |
| Ceiling Second Block | 3 hours 1 minute | ₹100.00 | **PASSED** |
| Exact Second Block | 6 hours | ₹100.00 | **PASSED** |
| Ceiling Third Block | 6 hours 1 minute | ₹150.00 | **PASSED** |
| Duration Formatting | 8130s | "2h 15m" | **PASSED** |

### 2. `BookingServiceTest`
- **Valid Booking**: Successfully reserves bay, generates unique booking reference and cryptographic QR token.
- **Overlap Prevention**: Verifies that two overlapping bookings for the same slot are rejected with `ConflictException`.
- **Vehicle Type Compatibility**: Ensures motorcycles cannot book Car slots, while Cars can book Car or Accessible bays.
- **Ownership Verification**: Non-owners cannot use another user's vehicles for booking.

### 3. `ParkingServiceTest`
- **Duplicate Session Prevention**: A vehicle already parked cannot start another active session.
- **Slot Maintenance Check**: Entry on bays marked for maintenance is blocked.
- **Checkout & Fee Settlement**: Completes session, calculates fee, and atomically frees the slot back to `AVAILABLE`.

### 4. `PaymentServiceTest`
- **Duplicate Payment Prevention**: Cannot pay for an already settled session.
- **Active Session Payment Guard**: Incomplete sessions cannot be billed until checked out.
- **Transaction Reference**: Validates unique `TXN-` code generation and `PAID` status.

---

## 4. Frontend Type Checking & Production Build

```powershell
cd "c:\Projects\Smart Parking System\frontend"
npm run build
```
Validates zero TypeScript type errors, JSX compilation, and asset bundling.
