import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, CreditCard, LogIn, QrCode, Search, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { ParkingLocation, ParkingSession, ParkingSlot, Vehicle } from '../types';

interface AdminGateScannerProps {
  locations: ParkingLocation[];
  slots: ParkingSlot[];
  activeSessions: ParkingSession[];
  onRefresh: () => void;
  onCheckoutSession: (session: ParkingSession) => void;
}

export const AdminGateScanner: React.FC<AdminGateScannerProps> = ({
  locations,
  slots,
  activeSessions,
  onRefresh,
  onCheckoutSession,
}) => {
  const { showToast } = useToast();
  const [qrToken, setQrToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Manual walk-in entry state
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInPlate, setWalkInPlate] = useState('');
  const [walkInSlotId, setWalkInSlotId] = useState<number>(0);

  const availableSlots = slots.filter((s) => s.status === 'AVAILABLE');

  const handleVerifyQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrToken.trim()) return;

    setIsVerifying(true);
    try {
      const session = await api.parking.verifyQrAndEntry(qrToken.trim());
      showToast(`Vehicle ${session.vehicleRegistration} authorized! Allocated Bay: ${session.slotNumber}`, 'success');
      setQrToken('');
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'QR Verification failed';
      showToast(msg, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleWalkInEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInPlate.trim() || !walkInSlotId) {
      showToast('Please provide vehicle plate and choose an available slot', 'error');
      return;
    }

    try {
      // First register or find vehicle, or use operator's entry
      // For walk-ins, let's create vehicle if needed via standard vehicle API or select existing
      // Let's create vehicle
      const newVehicle = await api.vehicles.create({
        registrationNumber: walkInPlate.toUpperCase().trim(),
        vehicleType: 'CAR',
      }).catch(async () => {
        // If already exists, fetch list to find id
        const userVehicles = await api.vehicles.getMyVehicles();
        return userVehicles.find((v) => v.registrationNumber === walkInPlate.toUpperCase().trim()) || userVehicles[0];
      });

      if (!newVehicle) {
        showToast('Could not register walk-in vehicle', 'error');
        return;
      }

      await api.parking.createEntry({
        vehicleId: newVehicle.id,
        slotId: walkInSlotId,
      });

      showToast(`Walk-in vehicle ${walkInPlate} checked in successfully!`, 'success');
      setWalkInPlate('');
      setShowWalkIn(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record entry';
      showToast(msg, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Gate Inbound Scanner Panel */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <QrCode size={22} color="#6366f1" />
              <h2 style={{ fontSize: '1.35rem' }}>Gate Inbound Scanner & Entry Verification</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Scan the customer's mobile QR code ticket or paste the security token to open boom barrier.
            </p>
          </div>

          <button
            onClick={() => setShowWalkIn(!showWalkIn)}
            className="btn btn-secondary btn-sm"
          >
            <LogIn size={15} /> {showWalkIn ? 'Close Walk-in' : 'Manual Walk-In Entry'}
          </button>
        </div>

        {/* QR Verification form */}
        <form onSubmit={handleVerifyQr} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="input-field"
              placeholder="Paste or scan QR token (e.g. qR92kL...)"
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              style={{
                fontFamily: 'JetBrains Mono',
                paddingLeft: '2.5rem',
                fontSize: '0.95rem',
              }}
            />
            <Search
              size={18}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying || !qrToken.trim()}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.75rem' }}
          >
            {isVerifying ? 'Verifying...' : 'Authorize Entry'}
          </button>
        </form>

        {/* Walk-in Form Drawer */}
        {showWalkIn && (
          <form
            onSubmit={handleWalkInEntry}
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: '1rem',
              alignItems: 'flex-end',
            }}
          >
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Vehicle Registration Number</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. MH-02-CD-5678"
                value={walkInPlate}
                onChange={(e) => setWalkInPlate(e.target.value)}
                required
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Assign Available Slot</label>
              <select
                className="input-field"
                value={walkInSlotId}
                onChange={(e) => setWalkInSlotId(Number(e.target.value))}
                required
              >
                <option value="">Choose an open bay...</option>
                {availableSlots.map((s) => (
                  <option key={s.id} value={s.id}>
                    Slot {s.slotNumber} ({s.slotType}) — {s.locationName}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-success">
              Assign & Open Gate
            </button>
          </form>
        )}
      </div>

      {/* Active Parked Cars Feed & Checkout Management */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Active Parked Vehicles ({activeSessions.length})</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Real-time monitoring of vehicles inside the facility and exit checkout processing.
            </p>
          </div>

          <button onClick={onRefresh} className="btn btn-secondary btn-sm">
            Refresh List
          </button>
        </div>

        {activeSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
            <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
            <p>No active vehicles parked currently. All slots ready for new arrivals.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Vehicle Plate</th>
                  <th>Bay & Location</th>
                  <th>Entry Time</th>
                  <th>Elapsed</th>
                  <th>Current Fee</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeSessions.map((s) => {
                  const entry = new Date(s.entryTime).getTime();
                  const durationSec = Math.max(0, Math.floor((Date.now() - entry) / 1000));
                  const hours = Math.floor(durationSec / 3600);
                  const minutes = Math.floor((durationSec % 3600) / 60);
                  const blocks = durationSec === 0 ? 0 : Math.ceil(durationSec / 10800);
                  const currentFee = blocks * 50;

                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
                          {s.vehicleRegistration}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {s.vehicleType} • {s.bookingReference ? `Ref: ${s.bookingReference}` : 'Walk-in'}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#38bdf8' }}>Bay {s.slotNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.locationName}</div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          {new Date(s.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {new Date(s.entryTime).toLocaleDateString()}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem', fontWeight: 600 }}>
                          {hours}h {minutes}m
                        </span>
                      </td>

                      <td>
                        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#10b981', fontSize: '1.05rem' }}>
                          ₹{currentFee.toFixed(2)}
                        </span>
                      </td>

                      <td>
                        <button
                          onClick={() => onCheckoutSession(s)}
                          className="btn btn-primary btn-sm"
                        >
                          <CreditCard size={14} /> Process Exit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
