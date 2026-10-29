import {
  AuthResponse,
  Booking,
  DashboardStats,
  FeeEstimate,
  NotificationItem,
  OccupancyStats,
  ParkingLocation,
  ParkingSession,
  ParkingSlot,
  Payment,
  RevenueReport,
  User,
  Vehicle,
} from '../types';

const BASE_URL = '/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

let authToken: string | null = localStorage.getItem('smartpark_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('smartpark_token', token);
  } else {
    localStorage.removeItem('smartpark_token');
  }
};

export const getAuthToken = () => authToken;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || data.error || `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status);
  }

  return data as T;
}

export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    register: (payload: { fullName: string; email: string; password: string }) =>
      request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getCurrentUser: () => request<User>('/auth/me'),
  },

  // Locations
  locations: {
    getAll: () => request<ParkingLocation[]>('/locations'),
    create: (payload: { name: string; address: string; description?: string }) =>
      request<ParkingLocation>('/locations', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: number, payload: Partial<ParkingLocation>) =>
      request<ParkingLocation>(`/locations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },

  // Slots
  slots: {
    getAll: (params?: { locationId?: number; type?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.locationId) q.append('locationId', params.locationId.toString());
      if (params?.type) q.append('type', params.type);
      if (params?.status) q.append('status', params.status);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return request<ParkingSlot[]>(`/slots${qs}`);
    },

    getAvailable: (params?: { locationId?: number; type?: string }) => {
      const q = new URLSearchParams();
      if (params?.locationId) q.append('locationId', params.locationId.toString());
      if (params?.type) q.append('type', params.type);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return request<ParkingSlot[]>(`/slots/available${qs}`);
    },

    getById: (id: number) => request<ParkingSlot>(`/slots/${id}`),

    create: (payload: {
      locationId: number;
      slotNumber: string;
      slotType: string;
      floor?: string;
      description?: string;
    }) =>
      request<ParkingSlot>('/slots', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    update: (id: number, payload: Partial<ParkingSlot>) =>
      request<ParkingSlot>(`/slots/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },

  // Vehicles
  vehicles: {
    getMyVehicles: () => request<Vehicle[]>('/vehicles'),
    create: (payload: { registrationNumber: string; vehicleType: string }) =>
      request<Vehicle>('/vehicles', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: number, payload: { registrationNumber?: string; vehicleType?: string }) =>
      request<Vehicle>(`/vehicles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    delete: (id: number) =>
      request<void>(`/vehicles/${id}`, {
        method: 'DELETE',
      }),
  },

  // Bookings
  bookings: {
    create: (payload: {
      vehicleId: number;
      slotId: number;
      startTime: string;
      endTime: string;
    }) =>
      request<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getMyBookings: (status?: string) => {
      const qs = status ? `?status=${status}` : '';
      return request<Booking[]>(`/bookings${qs}`);
    },

    getById: (id: number) => request<Booking>(`/bookings/${id}`),

    cancel: (id: number) =>
      request<Booking>(`/bookings/${id}/cancel`, {
        method: 'POST',
      }),

    getTicket: (id: number) => request<Booking>(`/bookings/${id}/ticket`),
  },

  // Parking Sessions
  parking: {
    createEntry: (payload: { vehicleId: number; slotId: number; bookingId?: number }) =>
      request<ParkingSession>('/parking/entry', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    verifyQrAndEntry: (qrToken: string) =>
      request<ParkingSession>('/parking/verify-qr', {
        method: 'POST',
        body: JSON.stringify({ qrToken }),
      }),

    getActiveSessions: () => request<ParkingSession[]>('/parking/active'),

    getMySessions: () => request<ParkingSession[]>('/parking/my-sessions'),

    getEstimate: (sessionId: number) => request<FeeEstimate>(`/parking/${sessionId}/estimate`),

    checkout: (sessionId: number) =>
      request<ParkingSession>(`/parking/${sessionId}/checkout`, {
        method: 'POST',
      }),
  },

  // Payments
  payments: {
    process: (payload: { sessionId: number; method: string }) =>
      request<Payment>('/payments', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getById: (id: number) => request<Payment>(`/payments/${id}`),

    getMyPayments: () => request<Payment[]>('/payments/my-payments'),
  },

  // Reports
  reports: {
    getDashboard: () => request<DashboardStats>('/reports/dashboard'),

    getRevenue: (params?: { date?: string; from?: string; to?: string }) => {
      const q = new URLSearchParams();
      if (params?.date) q.append('date', params.date);
      if (params?.from) q.append('from', params.from);
      if (params?.to) q.append('to', params.to);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return request<RevenueReport>(`/reports/revenue${qs}`);
    },

    getOccupancy: () => request<OccupancyStats>('/reports/occupancy'),

    getSummary: () => request<Record<string, unknown>>('/reports/summary'),
  },

  // Admin
  admin: {
    getAllUsers: () => request<User[]>('/admin/users'),

    updateUserStatus: (userId: number, status: string) =>
      request<User>(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    updateUserRole: (userId: number, role: string) =>
      request<User>(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),

    getAllBookings: () => request<Booking[]>('/admin/bookings'),

    getAuditLogs: (page = 0, size = 20) =>
      request<{ content: Array<{ id: number; actorName: string; actorEmail?: string; action: string; resourceType: string; resourceId?: number; metadata?: string; timestamp: string }>; totalElements: number }>(
        `/admin/audit-logs?page=${page}&size=${size}`
      ),
  },

  // Notifications
  notifications: {
    getAll: () => request<NotificationItem[]>('/notifications'),

    markAsRead: (id: number) =>
      request<void>(`/notifications/${id}/read`, {
        method: 'PATCH',
      }),

    markAllAsRead: () =>
      request<void>('/notifications/read-all', {
        method: 'POST',
      }),
  },
};
