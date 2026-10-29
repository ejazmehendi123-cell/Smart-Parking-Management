import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, CreditCard, DollarSign, Smartphone, Wallet, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Payment, PaymentMethod } from '../types';
import { ReceiptView } from './ReceiptView';

interface PaymentModalProps {
  sessionId: number;
  totalBill: number;
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  sessionId,
  totalBill,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const payment = await api.payments.process({
        sessionId,
        method,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      showToast(`Payment of ₹${totalBill} confirmed!`, 'success');
      setCompletedPayment(payment);
      onSuccess(payment);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment failed';
      showToast(msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (completedPayment) {
    return <ReceiptView payment={completedPayment} onClose={onClose} />;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        {/* Header */}
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
            <h2 style={{ fontSize: '1.4rem' }}>Settle Parking Fee</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Session #{sessionId} • Automated Billing Checkout
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Amount Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Amount Due
          </div>
          <div style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', margin: '0.25rem 0' }}>
            ₹{totalBill.toFixed(2)}
          </div>
          <div
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.12)',
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            DEMO MODE — Auto Simulated Instant Approval
          </div>
        </div>

        {/* Payment Method Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
            Select Payment Method
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => setMethod('UPI')}
              className="btn"
              style={{
                flexDirection: 'column',
                gap: '0.4rem',
                padding: '0.85rem 0.5rem',
                background: method === 'UPI' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                borderColor: method === 'UPI' ? 'var(--primary)' : 'var(--border-light)',
                color: method === 'UPI' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <Smartphone size={20} color={method === 'UPI' ? '#6366f1' : '#94a3b8'} />
              <span style={{ fontSize: '0.8rem' }}>UPI App / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('ONLINE')}
              className="btn"
              style={{
                flexDirection: 'column',
                gap: '0.4rem',
                padding: '0.85rem 0.5rem',
                background: method === 'ONLINE' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                borderColor: method === 'ONLINE' ? 'var(--primary)' : 'var(--border-light)',
                color: method === 'ONLINE' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <CreditCard size={20} color={method === 'ONLINE' ? '#6366f1' : '#94a3b8'} />
              <span style={{ fontSize: '0.8rem' }}>Card / Netbanking</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('CASH')}
              className="btn"
              style={{
                flexDirection: 'column',
                gap: '0.4rem',
                padding: '0.85rem 0.5rem',
                background: method === 'CASH' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                borderColor: method === 'CASH' ? 'var(--primary)' : 'var(--border-light)',
                color: method === 'CASH' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <Wallet size={20} color={method === 'CASH' ? '#6366f1' : '#94a3b8'} />
              <span style={{ fontSize: '0.8rem' }}>Gate Attendant</span>
            </button>
          </div>
        </div>

        {/* Method-specific preview */}
        {method === 'UPI' && (
          <div
            style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ background: '#fff', padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'inline-block' }}>
              <QRCodeSVG value={`upi://pay?pa=smartpark@bank&pn=SmartPark&am=${totalBill}&cu=INR`} size={130} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              VPA: <strong>smartpark@icici</strong>
            </div>
          </div>
        )}

        {method === 'ONLINE' && (
          <div
            style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <div className="input-group" style={{ marginBottom: '0.75rem' }}>
              <label className="input-label">Card Number</label>
              <input type="text" className="input-field" defaultValue="•••• •••• •••• 4242" readOnly />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Expiry</label>
                <input type="text" className="input-field" defaultValue="12/28" readOnly />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">CVV</label>
                <input type="text" className="input-field" defaultValue="•••" readOnly />
              </div>
            </div>
          </div>
        )}

        {method === 'CASH' && (
          <div
            style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              textAlign: 'center',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            Hand over cash to the gate operator on exit to receive a physical printed voucher.
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handlePay}
          disabled={isProcessing}
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
        >
          {isProcessing ? 'Processing Transaction...' : `Confirm & Pay ₹${totalBill.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};
