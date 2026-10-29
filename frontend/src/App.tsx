import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AdminDashboard } from './views/AdminDashboard';
import { AuthView } from './views/AuthView';
import { CustomerDashboard } from './views/CustomerDashboard';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          background: 'var(--bg-primary)',
          color: 'var(--text-muted)',
        }}
      >
        <div
          style={{
            width: '45px',
            height: '45px',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>INITIALIZING SMARTPARK...</span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {user.role === 'CUSTOMER' ? <CustomerDashboard /> : <AdminDashboard />}
      </main>

      {/* Footer */}
      <footer
        className="no-print"
        style={{
          borderTop: '1px solid var(--border-light)',
          padding: '1.5rem',
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontSize: '0.8rem',
          background: 'rgba(10, 13, 20, 0.6)',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <strong>SmartPark</strong> © 2026 • Full-Stack Automated Parking, Reservation & Billing System
          </div>
          <div>
            Deterministic Pricing: <span style={{ color: '#10b981', fontWeight: 600 }}>₹50 / 3-hour block</span> • Gate QR Verification Engine
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
