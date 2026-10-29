import React, { useEffect, useState } from 'react';
import { BarChart3, Calendar, Clock, DollarSign, Layers, PieChart, TrendingUp, Users } from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, OccupancyStats, RevenueReport } from '../types';

export const AdminAnalytics: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancyStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [dashData, occData, revData] = await Promise.all([
          api.reports.getDashboard(),
          api.reports.getOccupancy(),
          api.reports.getRevenue(),
        ]);
        setDashboard(dashData);
        setOccupancy(occData);
        setRevenue(revData);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading || !dashboard || !occupancy) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading real-time facility analytics & revenue reports...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {/* Today Revenue */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <DollarSign size={26} />
          </div>
          <div>
            <div className="stat-val">₹{dashboard.todayRevenue ? Number(dashboard.todayRevenue).toFixed(2) : '0.00'}</div>
            <div className="stat-lbl">Today's Revenue</div>
          </div>
        </div>

        {/* Month Revenue */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
            <TrendingUp size={26} />
          </div>
          <div>
            <div className="stat-val">₹{dashboard.monthRevenue ? Number(dashboard.monthRevenue).toFixed(2) : '0.00'}</div>
            <div className="stat-lbl">Monthly Revenue</div>
          </div>
        </div>

        {/* Real-time Occupancy */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Layers size={26} />
          </div>
          <div>
            <div className="stat-val">{occupancy.occupancyPercentage}%</div>
            <div className="stat-lbl">{occupancy.occupiedSlots} of {occupancy.totalSlots} Slots Occupied</div>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Clock size={26} />
          </div>
          <div>
            <div className="stat-val">{dashboard.activeBookings}</div>
            <div className="stat-lbl">Active & Confirmed Bookings</div>
          </div>
        </div>

        {/* Registered Drivers */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <Users size={26} />
          </div>
          <div>
            <div className="stat-val">{dashboard.totalCustomers}</div>
            <div className="stat-lbl">Registered Customers</div>
          </div>
        </div>
      </div>

      {/* Occupancy by Facility Location */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Location Occupancy Breakdown</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Real-time utilization percentages across all integrated parking sites.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {occupancy.byLocation.map((loc) => (
            <div key={loc.locationId}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 600 }}>{loc.locationName}</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {loc.occupiedSlots} / {loc.totalSlots} bays ({loc.occupancyPercentage}%)
                </span>
              </div>

              {/* Progress meter */}
              <div
                style={{
                  height: '10px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-light)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, loc.occupancyPercentage)}%`,
                    background:
                      loc.occupancyPercentage > 85
                        ? '#ef4444'
                        : loc.occupancyPercentage > 50
                        ? '#f59e0b'
                        : '#10b981',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 600ms ease-out',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Breakdown by Method & Location */}
      {revenue && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Revenue by Payment Method */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Revenue by Payment Channel</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {Object.keys(revenue.revenueByMethod || {}).length === 0 ? (
                <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No payments collected yet</div>
              ) : (
                Object.entries(revenue.revenueByMethod).map(([method, amount]) => (
                  <div
                    key={method}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{method}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#10b981' }}>
                      ₹{Number(amount).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Revenue by Location */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Revenue by Location</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {Object.keys(revenue.revenueByLocation || {}).length === 0 ? (
                <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No payments collected yet</div>
              ) : (
                Object.entries(revenue.revenueByLocation).map(([locName, amount]) => (
                  <div
                    key={locName}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{locName}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#6366f1' }}>
                      ₹{Number(amount).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
