import React, { useEffect, useState } from 'react';
import { BarChart3, Clock, Layers, Plus, QrCode, Shield, Users, Wrench } from 'lucide-react';
import { AdminAnalytics } from '../components/AdminAnalytics';
import { AdminGateScanner } from '../components/AdminGateScanner';
import { AdminUserManagement } from '../components/AdminUserManagement';
import { PaymentModal } from '../components/PaymentModal';
import { SlotMap } from '../components/SlotMap';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Booking, ParkingLocation, ParkingSession, ParkingSlot, SlotStatus, SlotType } from '../types';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'SCANNER' | 'ANALYTICS' | 'SLOTS' | 'USERS' | 'GLOBAL_BOOKINGS'>('SCANNER');

  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [activeSessions, setActiveSessions] = useState<ParkingSession[]>([]);
  const [globalBookings, setGlobalBookings] = useState<Booking[]>([]);

  // Checkout modal
  const [checkoutModal, setCheckoutModal] = useState<{ sessionId: number; bill: number } | null>(null);

  // New slot modal
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlotNumber, setNewSlotNumber] = useState('');
  const [newSlotType, setNewSlotType] = useState<SlotType>('CAR');
  const [newSlotFloor, setNewSlotFloor] = useState('Ground');

  const fetchData = async () => {
    try {
      const [locs, active, allBookings] = await Promise.all([
        api.locations.getAll(),
        api.parking.getActiveSessions(),
        user?.role === 'ADMIN' ? api.admin.getAllBookings() : Promise.resolve([]),
      ]);
      setLocations(locs);
      if (locs.length > 0 && !selectedLocationId) {
        setSelectedLocationId(locs[0].id);
      }
      setActiveSessions(active);
      setGlobalBookings(allBookings);
    } catch (err) {
      console.error('Failed to load admin data', err);
    }
  };

  const fetchSlots = async (locationId: number) => {
    try {
      const slotsData = await api.slots.getAll({ locationId });
      setSlots(slotsData);
    } catch (err) {
      console.error('Failed to load slots', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedLocationId) {
      fetchSlots(selectedLocationId);
    }
  }, [selectedLocationId]);

  const handleCheckoutProcess = async (session: ParkingSession) => {
    try {
      const completed = await api.parking.checkout(session.id);
      showToast(`Vehicle ${session.vehicleRegistration} checked out. Fee: ₹${completed.totalBill}`, 'success');
      setCheckoutModal({
        sessionId: completed.id,
        bill: completed.totalBill || 50,
      });
      fetchData();
      if (selectedLocationId) fetchSlots(selectedLocationId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      showToast(msg, 'error');
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocationId || !newSlotNumber.trim()) return;

    try {
      await api.slots.create({
        locationId: selectedLocationId,
        slotNumber: newSlotNumber.toUpperCase().trim(),
        slotType: newSlotType,
        floor: newSlotFloor,
      });
      showToast(`Slot ${newSlotNumber} created successfully!`, 'success');
      setNewSlotNumber('');
      setShowAddSlot(false);
      fetchSlots(selectedLocationId);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create slot';
      showToast(msg, 'error');
    }
  };

  const handleToggleMaintenance = async (slotId: number, currentStatus: SlotStatus) => {
    const newStatus = currentStatus === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    try {
      await api.slots.update(slotId, { status: newStatus });
      showToast(`Slot status toggled to ${newStatus}`, 'info');
      if (selectedLocationId) fetchSlots(selectedLocationId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update slot';
      showToast(msg, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.75rem' }}>
              {user?.role === 'ADMIN' ? 'Control & Governance Center' : 'Gate Operator Console'}
            </h1>
            <span className="badge badge-primary">{user?.role}</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Real-time gate barrier management, QR code authorization, bay inventory, and financial reporting.
          </p>
        </div>

        {/* Status ticker */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="badge badge-available">
            <span className="pulse-dot green" /> System Online
          </span>
          <span className="badge badge-primary">
            {activeSessions.length} Parked Vehicles
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.65rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '1rem',
        }}
      >
        <button
          onClick={() => setActiveTab('SCANNER')}
          className="btn"
          style={{
            background: activeTab === 'SCANNER' ? 'var(--primary)' : 'var(--bg-tertiary)',
            color: activeTab === 'SCANNER' ? '#fff' : 'var(--text-muted)',
          }}
        >
          <QrCode size={17} /> Gate Inbound & Checkout ({activeSessions.length})
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className="btn"
          style={{
            background: activeTab === 'ANALYTICS' ? 'var(--primary)' : 'var(--bg-tertiary)',
            color: activeTab === 'ANALYTICS' ? '#fff' : 'var(--text-muted)',
          }}
        >
          <BarChart3 size={17} /> Facility Analytics & Revenue
        </button>

        <button
          onClick={() => setActiveTab('SLOTS')}
          className="btn"
          style={{
            background: activeTab === 'SLOTS' ? 'var(--primary)' : 'var(--bg-tertiary)',
            color: activeTab === 'SLOTS' ? '#fff' : 'var(--text-muted)',
          }}
        >
          <Layers size={17} /> Slot Inventory & Maintenance
        </button>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('USERS')}
            className="btn"
            style={{
              background: activeTab === 'USERS' ? 'var(--primary)' : 'var(--bg-tertiary)',
              color: activeTab === 'USERS' ? '#fff' : 'var(--text-muted)',
            }}
          >
            <Users size={17} /> User Governance & Audit Trail
          </button>
        )}

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('GLOBAL_BOOKINGS')}
            className="btn"
            style={{
              background: activeTab === 'GLOBAL_BOOKINGS' ? 'var(--primary)' : 'var(--bg-tertiary)',
              color: activeTab === 'GLOBAL_BOOKINGS' ? '#fff' : 'var(--text-muted)',
            }}
          >
            <Clock size={17} /> All Bookings ({globalBookings.length})
          </button>
        )}
      </div>

      {/* Tab 1: Gate Scanner & Checkouts */}
      {activeTab === 'SCANNER' && (
        <AdminGateScanner
          locations={locations}
          slots={slots}
          activeSessions={activeSessions}
          onRefresh={fetchData}
          onCheckoutSession={(session) => handleCheckoutProcess(session)}
        />
      )}

      {/* Tab 2: Analytics & Reporting */}
      {activeTab === 'ANALYTICS' && <AdminAnalytics />}

      {/* Tab 3: Slot Inventory & Management */}
      {activeTab === 'SLOTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Header & Add Slot Button */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem' }}>Parking Bay Inventory & Maintenance</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Inspect and toggle bay operational status (Available / Maintenance) or add new slots.
                </p>
              </div>

              {user?.role === 'ADMIN' && (
                <button onClick={() => setShowAddSlot(!showAddSlot)} className="btn btn-primary btn-sm">
                  <Plus size={16} /> Add Parking Slot
                </button>
              )}
            </div>

            {/* Add Slot Form */}
            {showAddSlot && (
              <form
                onSubmit={handleCreateSlot}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
                  gap: '1rem',
                  alignItems: 'flex-end',
                }}
              >
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Slot Number / Bay ID</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. D-401"
                    value={newSlotNumber}
                    onChange={(e) => setNewSlotNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Slot Type</label>
                  <select
                    className="input-field"
                    value={newSlotType}
                    onChange={(e) => setNewSlotType(e.target.value as SlotType)}
                  >
                    <option value="CAR">Car</option>
                    <option value="MOTORCYCLE">Motorcycle</option>
                    <option value="EV">EV Charger Bay</option>
                    <option value="ACCESSIBLE">Accessible</option>
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Floor</label>
                  <select
                    className="input-field"
                    value={newSlotFloor}
                    onChange={(e) => setNewSlotFloor(e.target.value)}
                  >
                    <option value="Ground">Ground</option>
                    <option value="1st Floor">1st Floor</option>
                    <option value="2nd Floor">2nd Floor</option>
                    <option value="Basement 1">Basement 1</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary">
                    Create Bay
                  </button>
                  <button type="button" onClick={() => setShowAddSlot(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Slots Inventory Table */}
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Bay Number</th>
                    <th>Facility Location</th>
                    <th>Bay Type</th>
                    <th>Floor</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot.id}>
                      <td style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc' }}>
                        {slot.slotNumber}
                      </td>

                      <td>{slot.locationName}</td>

                      <td>
                        <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                          {slot.slotType}
                        </span>
                      </td>

                      <td style={{ color: 'var(--text-muted)' }}>{slot.floor || 'Ground'}</td>

                      <td>
                        <span className={`badge badge-${slot.status.toLowerCase()}`}>{slot.status}</span>
                      </td>

                      <td>
                        {slot.status === 'AVAILABLE' || slot.status === 'MAINTENANCE' ? (
                          <button
                            onClick={() => handleToggleMaintenance(slot.id, slot.status)}
                            className={`btn btn-sm ${slot.status === 'MAINTENANCE' ? 'btn-success' : 'btn-danger'}`}
                            style={{ fontSize: '0.75rem' }}
                          >
                            <Wrench size={13} />
                            {slot.status === 'MAINTENANCE' ? 'Restore to Available' : 'Put under Maintenance'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Occupied / Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: User Governance & Audit Logs (Admin Only) */}
      {activeTab === 'USERS' && user?.role === 'ADMIN' && <AdminUserManagement />}

      {/* Tab 5: Global Bookings Master List (Admin Only) */}
      {activeTab === 'GLOBAL_BOOKINGS' && user?.role === 'ADMIN' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>Global Reservations Master Log</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Comprehensive register of all bookings made across all users and facilities.
          </p>

          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Facility & Bay</th>
                  <th>Vehicle</th>
                  <th>Scheduled Window</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {globalBookings.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: '#a5b4fc' }}>
                      {b.bookingReference}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{b.userName}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#38bdf8' }}>Bay {b.slotNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{b.locationName}</div>
                    </td>

                    <td>
                      <div>{b.vehicleRegistration}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{b.vehicleType}</div>
                    </td>

                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(b.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} -{' '}
                      {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td>
                      <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Checkout Payment Modal */}
      {checkoutModal && (
        <PaymentModal
          sessionId={checkoutModal.sessionId}
          totalBill={checkoutModal.bill}
          onClose={() => setCheckoutModal(null)}
          onSuccess={() => {
            fetchData();
            if (selectedLocationId) fetchSlots(selectedLocationId);
          }}
        />
      )}
    </div>
  );
};
