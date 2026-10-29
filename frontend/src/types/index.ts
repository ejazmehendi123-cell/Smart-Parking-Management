// Core TypeScript interfaces matching backend models

export type Role = 'ADMIN' | 'OPERATOR' | 'CUSTOMER';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  accountStatus: AccountStatus;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export type SlotType = 'CAR' | 'MOTORCYCLE' | 'EV' | 'ACCESSIBLE';
export type SlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export interface ParkingLocation {
  id: number;
  name: string;
  address: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalSlots: number;
  availableSlots: number;
  createdAt: string;
}

export interface ParkingSlot {
  id: number;
  locationId: number;
  locationName: string;
  slotNumber: string;
  slotType: SlotType;
  status: SlotStatus;
  floor?: string;
  description?: string;
  createdAt: string;
}

export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'EV';

export interface Vehicle {
  id: number;
  registrationNumber: string;
  vehicleType: VehicleType;
  createdAt: string;
}

export type BookingStatus = 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface Booking {
  id: number;
  userId: number;
  userName: string;
  vehicleId: number;
  vehicleRegistration: string;
  vehicleType: VehicleType;
  slotId: number;
  slotNumber: string;
  slotType: SlotType;
  locationName: string;
  startTime: string;
  endTime: string;
  bookingReference: string;
  qrToken: string;
  status: BookingStatus;
  createdAt: string;
}

export type SessionStatus = 'ACTIVE' | 'COMPLETED';

export interface ParkingSession {
  id: number;
  bookingId?: number;
  bookingReference?: string;
  vehicleId: number;
  vehicleRegistration: string;
  vehicleType: VehicleType;
  slotId: number;
  slotNumber: string;
  locationName: string;
  entryTime: string;
  exitTime?: string;
  appliedRate: number;
  totalBill?: number;
  sessionStatus: SessionStatus;
  durationSeconds: number;
  estimatedFee?: number;
  createdAt: string;
}

export interface FeeEstimate {
  sessionId: number;
  durationSeconds: number;
  durationFormatted: string;
  estimatedFee: number;
  ratePerBlock: number;
  blockHours: number;
}

export type PaymentMethod = 'CASH' | 'UPI' | 'ONLINE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: number;
  sessionId: number;
  vehicleRegistration: string;
  locationName: string;
  slotNumber: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference: string;
  paymentTimestamp: string;
  entryTime: string;
  exitTime: string;
  durationSeconds: number;
  createdAt: string;
}

export interface DashboardStats {
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  reservedSlots: number;
  maintenanceSlots: number;
  totalBookings: number;
  activeBookings: number;
  totalCustomers: number;
  activeSessions: number;
  todayRevenue: number;
  monthRevenue: number;
  todayCompletedSessions: number;
}

export interface OccupancyStats {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  reservedSlots: number;
  maintenanceSlots: number;
  occupancyPercentage: number;
  byLocation: {
    locationId: number;
    locationName: string;
    totalSlots: number;
    occupiedSlots: number;
    availableSlots: number;
    occupancyPercentage: number;
  }[];
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface RevenueReport {
  totalRevenue: number;
  totalSessions: number;
  averageDurationMinutes?: number;
  dailyRevenue: DailyRevenue[];
  monthlyRevenue: MonthlyRevenue[];
  revenueByMethod: Record<string, number>;
  revenueByLocation: Record<string, number>;
}

export interface NotificationItem {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: number;
  actorName: string;
  actorEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: number;
  metadata?: string;
  timestamp: string;
}
