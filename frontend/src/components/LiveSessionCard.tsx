import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock, CreditCard, DollarSign, MapPin, Shield } from 'lucide-react';
import { ParkingSession } from '../types';

interface LiveSessionCardProps {
  session: ParkingSession;
  onCheckout: (sessionId: number) => void;
}

export const LiveSessionCard: React.FC<LiveSessionCardProps> = ({
  session,
  onCheckout,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const entry = new Date(session.entryTime).getTime();
    return Math.max(0, Math.floor((Date.now() - entry) / 1000));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const entry = new Date(session.entryTime).getTime();
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - entry) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [session.entryTime]);

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const pad = (n: number) => (n < 10 ? '0' + n : n);

  // Fee calculation: ₹50 per 3-hour block
  const blockSeconds = 3 * 3600;
  const blocks = elapsedSeconds === 0 ? 0 : Math.ceil(elapsedSeconds / blockSeconds);
  const liveCost = blocks * 50;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.75rem',
        borderLeft: '4px solid #10b981',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        {/* Left: Vehicle and Slot info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <span className="pulse-dot green" />
            <span
              style={{
                fontFamily: 'Outfit',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#10b981',
                letterSpacing: '0.05em',
              }}
            >
              Active Parking Session
            </span>
            {session.bookingReference && (
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                Ref: {session.bookingReference}
              </span>
            )}
          </div>

          <h3 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
            {session.vehicleRegistration}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <MapPin size={16} color="#6366f1" />
            <span>
              {session.locationName} • <strong>Slot {session.slotNumber}</strong>
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
            Entered at: {new Date(session.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (
            {new Date(session.entryTime).toLocaleDateString()})
          </div>
        </div>

        {/* Center: Live Timer and Cost Ticker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2.5rem',
            background: 'var(--bg-secondary)',
            padding: '1rem 1.75rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
          }}
        >
          {/* Elapsed Timer */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Elapsed Time
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '1.65rem', fontWeight: 700, color: '#f8fafc' }}>
              {pad(hours)}:{pad(minutes)}:{pad(seconds)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              Block {blocks} of 3h interval
            </div>
          </div>

          <div style={{ width: '1px', height: '45px', background: 'var(--border-light)' }} />

          {/* Live Billing Cost */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Current Accumulated Fee
            </div>
            <div className="cost-ticker">
              ₹{liveCost.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              ₹50.00 / 3hr block
            </div>
          </div>
        </div>

        {/* Right: Checkout Action */}
        <div>
          <button
            onClick={() => onCheckout(session.id)}
            className="btn btn-primary btn-lg"
            style={{
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
            }}
          >
            <CreditCard size={18} /> End Session & Pay
          </button>
        </div>
      </div>
    </div>
  );
};
