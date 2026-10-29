import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Calendar, CheckCircle2, Clock, DollarSign, ShieldAlert, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Booking, ParkingSlot, Vehicle } from '../types';

interface BookingModalProps {
  slot: ParkingSlot | null;
  vehicles: Vehicle[];
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  slot,
  vehicles,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();

  // Compatible vehicles based on slot type
  const compatibleVehicles = vehicles.filter((v) => {
    if (!slot) return true;
    if (slot.slotType === 'CAR') return v.vehicleType === 'CAR';
    if (slot.slotType === 'MOTORCYCLE') return v.vehicleType === 'MOTORCYCLE';
    if (slot.slotType === 'EV') return v.vehicleType === 'EV';
    if (slot.slotType === 'ACCESSIBLE') return v.vehicleType === 'CAR' || v.vehicleType === 'EV';
    return false;
  });

  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(
    compatibleVehicles.length > 0 ? compatibleVehicles[0].id : 0
  );

  // Default start: now, default end: +3 hours
  const formatDateTimeInput = (d: Date) => {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const now = new Date();
  const later = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  const [startTime, setStartTime] = useState<string>(formatDateTimeInput(now));
  const [endTime, setEndTime] = useState<string>(formatDateTimeInput(later));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!slot) return null;

  // Calculate estimated fee
  const startD = new Date(startTime);
  const endD = new Date(endTime);
  const diffSec = Math.max(0, (endD.getTime() - startD.getTime()) / 1000);
  const blocks = Math.ceil(diffSec / (3 * 3600));
  const estimatedFee = blocks * 50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVehicleId) {
      showToast('Please select a compatible vehicle for this slot', 'error');
      return;
    }

    if (endD <= startD) {
      showToast('End time must be after start time', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const booking = await api.bookings.create({
        slotId: slot.id,
        vehicleId: selectedVehicleId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      showToast(`Slot ${slot.slotNumber} reserved! Reference: ${booking.bookingReference}`, 'success');
      onSuccess(booking);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create booking';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Reserve Parking Slot</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {slot.locationName} • Bay {slot.slotNumber} ({slot.slotType})
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Vehicle Selection */}
          <div className="input-group">
            <label className="input-label">Select Your Vehicle</label>
            {compatibleVehicles.length === 0 ? (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                }}
              >
                <ShieldAlert size={20} />
                <span>
                  You have no registered <strong>{slot.slotType}</strong> vehicles. Add a matching vehicle in
                  the "My Garage" tab first.
                </span>
              </div>
            ) : (
              <select
                className="input-field"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
                required
              >
                {compatibleVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    🚗 {v.registrationNumber} ({v.vehicleType})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Time Picker Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">
                <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
                Arrival Time
              </label>
              <input
                type="datetime-local"
                className="input-field"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <Clock size={13} style={{ display: 'inline', marginRight: 4 }} />
                Expected Departure
              </label>
              <input
                type="datetime-local"
                className="input-field"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Pricing Estimation Box */}
          <div
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              margin: '1.5rem 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Deterministic Pricing Rule
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                ₹50 per 3-hour block (or fraction)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                Estimated Duration: ~{Math.round(diffSec / 3600)}h ({blocks} block{blocks > 1 ? 's' : ''})
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Estimated Total
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>
                ₹{estimatedFee.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Submit & Cancel Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || compatibleVehicles.length === 0}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
