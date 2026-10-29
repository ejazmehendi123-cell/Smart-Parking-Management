import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, CheckCircle2, Copy, Download, MapPin, Printer, ShieldCheck, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Booking } from '../types';

interface QrTicketModalProps {
  booking: Booking | null;
  onClose: () => void;
  onGateCheckIn?: (qrToken: string) => void;
}

export const QrTicketModal: React.FC<QrTicketModalProps> = ({
  booking,
  onClose,
  onGateCheckIn,
}) => {
  const { showToast } = useToast();
  const ticketRef = useRef<HTMLDivElement>(null);

  if (!booking) return null;

  const handleCopyToken = () => {
    navigator.clipboard.writeText(booking.qrToken);
    showToast('QR token copied to clipboard!', 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        {/* Modal Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Digital Ticket Pass Container */}
        <div ref={ticketRef} className="ticket-pass">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.7rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                DIGITAL PARKING PASS
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                Smart<span className="gradient-text">Park</span>
              </div>
            </div>

            <span className={`badge badge-${booking.status.toLowerCase()}`}>
              {booking.status}
            </span>
          </div>

          {/* Reference code pill */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              fontFamily: 'JetBrains Mono',
              fontSize: '1rem',
              letterSpacing: '0.05em',
            }}
          >
            <span>{booking.bookingReference}</span>
            <button
              onClick={handleCopyToken}
              style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', padding: 2 }}
              title="Copy Token"
            >
              <Copy size={14} />
            </button>
          </div>

          {/* High-res Scannable QR Code */}
          <div className="ticket-qr-container">
            <QRCodeSVG
              value={booking.qrToken}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
            Scan at gate scanner or present token to parking attendant
          </div>

          {/* Ticket Information Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.85rem',
              textAlign: 'left',
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Facility</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{booking.locationName}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Slot & Type</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8' }}>
                Bay {booking.slotNumber} ({booking.slotType})
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Vehicle</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{booking.vehicleRegistration}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Driver</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{booking.userName}</div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Valid Timeframe</div>
              <div style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
                {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (
                {new Date(booking.startTime).toLocaleDateString()})
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginTop: '1.25rem',
            justifyContent: 'space-between',
          }}
        >
          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer size={16} /> Print Pass
          </button>

          {/* Quick gate check-in simulator */}
          {booking.status === 'CONFIRMED' && onGateCheckIn && (
            <button
              onClick={() => onGateCheckIn(booking.qrToken)}
              className="btn btn-success"
            >
              <ShieldCheck size={16} /> Simulate Gate Check-In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
