import React from 'react';
import { CheckCircle2, Download, Printer, Share2, X } from 'lucide-react';
import { Payment } from '../types';

interface ReceiptViewProps {
  payment: Payment;
  onClose: () => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({ payment, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const durationMin = Math.round(payment.durationSeconds / 60);
  const durationHours = (payment.durationSeconds / 3600).toFixed(1);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content receipt-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          background: '#ffffff',
          color: '#0f172a',
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Modal Close Button */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ borderRadius: '50%', background: '#f1f5f9', color: '#475569' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Receipt Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #cbd5e1', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: '#0f172a', fontWeight: 800 }}>
            Payment Successful
          </h2>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Official Parking Tax Invoice & Receipt
          </div>
          <div
            style={{
              display: 'inline-block',
              marginTop: '0.5rem',
              padding: '0.2rem 0.65rem',
              background: '#f1f5f9',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontFamily: 'JetBrains Mono',
              fontWeight: 600,
              color: '#334155',
            }}
          >
            TXN: {payment.transactionReference}
          </div>
        </div>

        {/* Receipt Details Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
            <span>Facility Location:</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{payment.locationName}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
            <span>Parking Slot:</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Bay {payment.slotNumber}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
            <span>Vehicle Plate:</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{payment.vehicleRegistration}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
            <span>Entry Timestamp:</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              {new Date(payment.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (
              {new Date(payment.entryTime).toLocaleDateString()})
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
            <span>Exit Timestamp:</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              {new Date(payment.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (
              {new Date(payment.exitTime).toLocaleDateString()})
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
            <span>Billed Duration:</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              {durationHours} hrs ({durationMin} mins)
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
            <span>Payment Method:</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{payment.method} (Settled)</span>
          </div>
        </div>

        {/* Total Bill Box */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Total Paid
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Includes all facility taxes (₹50 / 3hr)</div>
          </div>

          <div style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color: '#16a34a' }}>
            ₹{payment.amount.toFixed(2)}
          </div>
        </div>

        {/* Demo Mode watermark */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#94a3b8',
            marginBottom: '1.5rem',
            fontStyle: 'italic',
          }}
        >
          DEMO MODE — Simulated College Project Payment System. No actual monetary exchange occurred.
        </div>

        {/* Actions */}
        <div className="no-print" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ background: '#0f172a', color: '#fff', border: 'none' }}
          >
            <Printer size={16} /> Print Receipt
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ background: '#e2e8f0', color: '#0f172a', border: 'none' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
