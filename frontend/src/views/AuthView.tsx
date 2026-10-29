import React, { useState } from 'react';
import { ArrowRight, Car, CheckCircle2, Clock, Lock, Mail, Shield, User, Wrench, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthView: React.FC = () => {
  const { login, register, loginAs } = useAuth();
  const { showToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isRegister) {
        if (!fullName.trim()) {
          showToast('Please enter your full name', 'error');
          setIsLoading(false);
          return;
        }
        await register(fullName, email, password);
        showToast('Registration successful! Welcome to SmartPark.', 'success');
      } else {
        await login(email, password);
        showToast('Logged in successfully!', 'success');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'ADMIN' | 'OPERATOR' | 'CUSTOMER') => {
    setIsLoading(true);
    try {
      await loginAs(role);
      showToast(`Logged in as ${role}!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Demo login failed';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1050px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center',
        }}
      >
        {/* Left: Branding & Feature Highlights */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.85rem',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-full)',
              marginBottom: '1.25rem',
            }}
          >
            <span className="pulse-dot green" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase' }}>
              Full-Stack Smart Parking System
            </span>
          </div>

          <h1 style={{ fontSize: '3rem', lineHeight: 1.1, marginBottom: '1.25rem' }}>
            Seamless Parking, <br />
            <span className="gradient-text">Zero Friction.</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Reserve bays in seconds, scan digital QR tickets at gate boom barriers, and experience automated
            real-time billing with simulated UPI & card checkout.
          </p>

          {/* Feature Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.15rem' }}>
              <div style={{ color: '#6366f1', marginBottom: '0.5rem' }}>
                <Clock size={22} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                Live Billing Ticker
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                ₹50 per 3-hour deterministic pricing engine.
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.15rem' }}>
              <div style={{ color: '#10b981', marginBottom: '0.5rem' }}>
                <Zap size={22} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                EV & Smart Bays
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Dedicated charging & accessible parking filters.
              </div>
            </div>
          </div>
        </div>

        {/* Right: Auth Card */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-tertiary)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.75rem',
            }}
          >
            <button
              onClick={() => setIsRegister(false)}
              className="btn btn-sm"
              style={{
                flex: 1,
                background: !isRegister ? 'var(--primary)' : 'transparent',
                color: !isRegister ? '#fff' : 'var(--text-muted)',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className="btn btn-sm"
              style={{
                flex: 1,
                background: isRegister ? 'var(--primary)' : 'transparent',
                color: isRegister ? '#fff' : 'var(--text-muted)',
              }}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <User
                    size={18}
                    color="var(--text-dim)"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="input-field"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail
                  size={18}
                  color="var(--text-dim)"
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock
                  size={18}
                  color="var(--text-dim)"
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
              <div style={{ marginTop: '0.45rem', fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Quick Fill:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('ejazmehendi123@gmail.com');
                    setPassword('Ejaz@123');
                    if (isRegister) setFullName('Ejaz Mehendi');
                  }}
                  style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#a5b4fc',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  ejazmehendi123@gmail.com
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {isLoading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              margin: '1.75rem 0',
              color: 'var(--text-dim)',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
            <span>OR 1-CLICK DEMO LOGIN</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
          </div>

          {/* 1-Click Demo Logins */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoLogin('CUSTOMER')}
              className="btn btn-secondary btn-sm"
              style={{ flexDirection: 'column', gap: '0.35rem', padding: '0.75rem 0.4rem' }}
            >
              <User size={16} color="#10b981" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Customer</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoLogin('OPERATOR')}
              className="btn btn-secondary btn-sm"
              style={{ flexDirection: 'column', gap: '0.35rem', padding: '0.75rem 0.4rem' }}
            >
              <Wrench size={16} color="#f59e0b" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Operator</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoLogin('ADMIN')}
              className="btn btn-secondary btn-sm"
              style={{ flexDirection: 'column', gap: '0.35rem', padding: '0.75rem 0.4rem' }}
            >
              <Shield size={16} color="#6366f1" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
