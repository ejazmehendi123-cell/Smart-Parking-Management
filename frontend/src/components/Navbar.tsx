import React, { useEffect, useState } from 'react';
import { Bell, Car, Check, LogOut, Shield, User, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NotificationItem, Role } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout, loginAs } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.getAll();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch {
      // ignore in silent polling
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  if (!user) return null;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(10, 13, 20, 0.82)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px var(--primary-glow)',
            }}
          >
            <Car size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  fontFamily: 'Outfit',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                }}
              >
                Smart<span className="gradient-text">Park</span>
              </span>
              <span
                className="badge"
                style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.45rem',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                v1.0
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.02em' }}>
              INTELLIGENT PARKING & BILLING
            </div>
          </div>
        </div>

        {/* Quick Demo Role Switcher */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-full)',
            padding: '3px',
            gap: '2px',
          }}
        >
          <button
            onClick={() => loginAs('CUSTOMER')}
            className="btn btn-sm"
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '0.25rem 0.65rem',
              fontSize: '0.75rem',
              background: user.role === 'CUSTOMER' ? 'var(--primary)' : 'transparent',
              color: user.role === 'CUSTOMER' ? '#fff' : 'var(--text-muted)',
              border: 'none',
            }}
          >
            <User size={12} /> Customer
          </button>
          <button
            onClick={() => loginAs('OPERATOR')}
            className="btn btn-sm"
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '0.25rem 0.65rem',
              fontSize: '0.75rem',
              background: user.role === 'OPERATOR' ? 'var(--primary)' : 'transparent',
              color: user.role === 'OPERATOR' ? '#fff' : 'var(--text-muted)',
              border: 'none',
            }}
          >
            <Wrench size={12} /> Operator
          </button>
          <button
            onClick={() => loginAs('ADMIN')}
            className="btn btn-sm"
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '0.25rem 0.65rem',
              fontSize: '0.75rem',
              background: user.role === 'ADMIN' ? 'var(--primary)' : 'transparent',
              color: user.role === 'ADMIN' ? '#fff' : 'var(--text-muted)',
              border: 'none',
            }}
          >
            <Shield size={12} /> Admin
          </button>
        </div>

        {/* Right Section: Notifications & User profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="btn btn-secondary btn-icon"
              title="Notifications"
              style={{ position: 'relative' }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  width: '320px',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '1rem',
                  zIndex: 100,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid var(--border-light)',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Check size={12} /> Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    No notifications yet
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {notifications.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: '0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                          borderLeft: n.isRead ? 'none' : '3px solid var(--primary)',
                          fontSize: '0.8rem',
                        }}
                      >
                        <p style={{ color: n.isRead ? 'var(--text-muted)' : 'var(--text-main)', marginBottom: '0.2rem' }}>
                          {n.message}
                        </p>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User profile capsule */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.35rem 0.65rem 0.35rem 0.35rem',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--brand-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {user.fullName.charAt(0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.fullName}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{user.role}</span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="btn btn-secondary btn-icon"
            title="Sign out"
            style={{ color: '#ef4444' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
