import React, { useEffect, useState } from 'react';
import { Calendar, Car, Clock, CreditCard, DollarSign, MapPin, QrCode, Receipt, ShieldCheck } from 'lucide-react';
import { BookingModal } from '../components/BookingModal';
import { LiveSessionCard } from '../components/LiveSessionCard';
import { PaymentModal } from '../components/PaymentModal';
import { QrTicketModal } from '../components/QrTicketModal';
import { ReceiptView } from '../components/ReceiptView';
import { SlotMap } from '../components/SlotMap';
import { VehicleManager } from '../components/VehicleManager';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Booking, ParkingLocation, ParkingSession, ParkingSlot, Payment, Vehicle } from '../types';

export const CustomerDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'MAP' | 'BOOKINGS' | 'SESSION' | 'VEHICLES' | 'PAYMENTS'>('MAP');

  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [mySessions, setMySessions] = useState<ParkingSession[]>([]);
  const [myPayments, setMyPayments] = useState<Payment[]>([]);

  // Modals state
  const [bookingSlot, setBookingSlot] = useState<ParkingSlot | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);
  const [paymentSession, setPaymentSession] = useState<{ id: number; bill: number } | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  const fetchData = async () => {
    try {
      const [locs, vehs, bks, sess, pmts] = await Promise.all([
        api.locations.getAll(),
        api.vehicles.getMyVehicles(),
        api.bookings.getMyBookings(),
        api.parking.getMySessions(),
        api.payments.getMyPayments(),
      ]);
      setLocations(locs);
      if (locs.length > 0 && !selectedLocationId) {
        setSelectedLocationId(locs[0].id);
      }
      setVehicles(vehs);
      setMyBookings(bks);
      setMySessions(sess);
      setMyPayments(pmts);
    } catch (err) {
      console.error('Failed to load customer data', err);
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

  // Find currently active parking session
  const activeSession = mySessions.find((s) => s.sessionStatus === 'ACTIVE');

  // Handle gate check-in simulation
  const handleSimulateGateCheckIn = async (qrToken: string) => {
    try {
      const session = await api.parking.verifyQrAndEntry(qrToken);
      showToast(`Vehicle ${session.vehicleRegistration} entered Bay ${session.slotNumber}! Gate boom barrier open.`, 'success');
      setSelectedTicket(null);
      fetchData();
      if (selectedLocationId) fetchSlots(selectedLocationId);
      setActiveTab('SESSION');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gate check-in failed';
      showToast(msg, 'error');
    }
  };

  // Handle checkout
  const handleCheckout = async (sessionId: number) => {
    try {
      const completed = await api.parking.checkout(sessionId);
      showToast(`Session completed. Total bill: ₹${completed.totalBill}`, 'info');
      setPaymentSession({ id: completed.id, bill: completed.totalBill || 50 });
      fetchData();
      if (selectedLocationId) fetchSlots(selectedLocationId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      showToast(msg, 'error');
    }
  };

  // Handle cancellation
  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking reservation?')) return;
    try {
      await api.bookings.cancel(bookingId);
      showToast('Booking cancelled successfully', 'info');
      fetchData();
      if (selectedLocationId) fetchSlots(selectedLocationId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cancel failed';
      showToast(msg, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Active Session Notification Banner if parked */}
      {activeSession && activeTab !== 'SESSION' && (
        <div
          onClick={() => setActiveTab('SESSION')}
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.5rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="pulse-dot green" />
            <div>
              <span style={{ fontWeight: 700, color: '#10b981' }}>Vehicle Currently Parked: </span>
              <span style={{ fontWeight: 600 }}>{activeSession.vehicleRegistration}</span> at{' '}
              <span style={{ color: '#38bdf8' }}>{activeSession.locationName} (Bay {activeSession.slotNumber})</span>
            </div>
          </div>

          <span className="btn btn-sm btn-primary">
            View Live Cost & Exit <Clock size={14} />
          </span>
        </div>
      )}

      {/* Main Tab Navigation */}
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
          onClick={() => setActiveTab('MAP')}
          className="btn"
          style={{
            background: activeTab === 'MAP' ? 'var(--primary)' : 'var(--bg-tertiary)',
            color: activeTab === 'MAP' ? '#fff' : 'var(--text-muted)',
          }}
        >
          <MapPin size={17} /> Live Parking Map
        </button>

        <button
          onClick={() => setActiveTab('BOOKINGS')}
          className="btn"
          style={{
            background: activeTab === 'BOOKINGS' ? 'var(--primary)' : 'var(--bg-tertiary)',
            color: activeTab === 'BOOKINGS' ? '#fff' : 'var(--text-muted)',
            position: 'relative',
          }}
        >
          <QrCode size={17} /> My Digital Passes ({myBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('SESSION')}
          className="btn"
          style={{
            background: activeTab === 'SESSION' ? 'var(--primary)' : 'var(--bg-tertiary)',
            color: activeTab === 'SESSION' ? '#fff' : 'var(--text-muted)',
          }}
        >
          <Clock size={17} /> Parked Session {activeSession && <span className="pulse-dot green" />}
        </button>

        <button
          onClick={() => setActiveTab('VEHICLES')}
          className="btn"
          style={{
            background: activeTab === 'VEHICLES' ? 'var(--primary)' : 'var(--bg-tertiary)',
            color: activeTab === 'VEHICLES' ? '#fff' : 'var(--text-muted)',
          }}
        >
          <Car size={17} /> My Garage ({vehicles.length})
        </button>

        <button
          onClick={() => setActiveTab('PAYMENTS')}
          className="btn"
          style={{
            background: activeTab === 'PAYMENTS' ? 'var(--primary)' : 'var(--bg-tertiary)',
            color: activeTab === 'PAYMENTS' ? '#fff' : 'var(--text-muted)',
          }}
        >
          <Receipt size={17} /> Billing & Receipts ({myPayments.length})
        </button>
      </div>

      {/* Tab 1: Interactive Slot Map */}
      {activeTab === 'MAP' && (
        <SlotMap
          locations={locations}
          selectedLocationId={selectedLocationId}
          onSelectLocation={(id) => setSelectedLocationId(id)}
          slots={slots}
          onSlotClick={(slot) => {
            if (slot.status === 'AVAILABLE') {
              setBookingSlot(slot);
            } else {
              showToast(`Bay ${slot.slotNumber} is currently ${slot.status.toLowerCase()}`, 'info');
            }
          }}
        />
      )}

      {/* Tab 2: My Bookings & QR Passes */}
      {activeTab === 'BOOKINGS' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>My Reservations & Passes</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Click on any active reservation to open your scannable digital boarding pass for gate entry.
          </p>

          {myBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-dim)' }}>
              <QrCode size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No bookings found. Select an open spot on the Parking Map to make a reservation.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Pass / Reference</th>
                    <th>Bay & Facility</th>
                    <th>Vehicle Plate</th>
                    <th>Scheduled Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <button
                          onClick={() => setSelectedTicket(b)}
                          className="btn btn-sm btn-outline"
                          style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}
                        >
                          <QrCode size={14} /> {b.bookingReference}
                        </button>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#38bdf8' }}>Bay {b.slotNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{b.locationName}</div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>{b.vehicleRegistration}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{b.vehicleType}</div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.8rem' }}>
                          {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {new Date(b.startTime).toLocaleDateString()}
                        </div>
                      </td>

                      <td>
                        <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setSelectedTicket(b)}
                            className="btn btn-secondary btn-sm"
                            title="Show QR Code"
                          >
                            Pass
                          </button>
                          {b.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="btn btn-danger btn-sm"
                              title="Cancel reservation"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Live Parked Session */}
      {activeTab === 'SESSION' && (
        <div>
          {activeSession ? (
            <LiveSessionCard
              session={activeSession}
              onCheckout={(id) => handleCheckout(id)}
            />
          ) : (
            <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
              <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                No Vehicle Currently Parked
              </h3>
              <p style={{ maxWidth: '450px', margin: '0 auto' }}>
                When your vehicle enters through the automated boom barrier, real-time timer tracking and billing
                accumulators will activate here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: My Garage Vehicles */}
      {activeTab === 'VEHICLES' && (
        <VehicleManager vehicles={vehicles} onRefresh={fetchData} />
      )}

      {/* Tab 5: Invoices and Receipts */}
      {activeTab === 'PAYMENTS' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>Billing & Payment Receipts</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Review past parking settlements, view transaction references, and print official tax vouchers.
          </p>

          {myPayments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-dim)' }}>
              <Receipt size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No payment transactions recorded yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Transaction Reference</th>
                    <th>Facility & Slot</th>
                    <th>Vehicle</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Payment Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myPayments.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem', color: '#a5b4fc' }}>
                        {p.transactionReference}
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>{p.locationName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Bay {p.slotNumber}</div>
                      </td>

                      <td style={{ fontWeight: 600 }}>{p.vehicleRegistration}</td>

                      <td style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#10b981', fontSize: '1.1rem' }}>
                        ₹{p.amount.toFixed(2)}
                      </td>

                      <td>
                        <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                          {p.method}
                        </span>
                      </td>

                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(p.paymentTimestamp).toLocaleString()}
                      </td>

                      <td>
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Receipt size={14} /> View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {bookingSlot && (
        <BookingModal
          slot={bookingSlot}
          vehicles={vehicles}
          onClose={() => setBookingSlot(null)}
          onSuccess={(booking) => {
            setBookingSlot(null);
            fetchData();
            if (selectedLocationId) fetchSlots(selectedLocationId);
            setSelectedTicket(booking);
          }}
        />
      )}

      {/* Digital QR Ticket Modal */}
      {selectedTicket && (
        <QrTicketModal
          booking={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onGateCheckIn={(token) => handleSimulateGateCheckIn(token)}
        />
      )}

      {/* Payment Processing Modal */}
      {paymentSession && (
        <PaymentModal
          sessionId={paymentSession.id}
          totalBill={paymentSession.bill}
          onClose={() => setPaymentSession(null)}
          onSuccess={() => {
            fetchData();
            if (selectedLocationId) fetchSlots(selectedLocationId);
          }}
        />
      )}

      {/* Receipt View Modal */}
      {selectedReceipt && (
        <ReceiptView
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
