import React, { useState } from 'react';
import { Bike, Car, Plus, Trash2, Zap } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Vehicle, VehicleType } from '../types';

interface VehicleManagerProps {
  vehicles: Vehicle[];
  onRefresh: () => void;
}

export const VehicleManager: React.FC<VehicleManagerProps> = ({ vehicles, onRefresh }) => {
  const { showToast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [regNumber, setRegNumber] = useState('');
  const [type, setType] = useState<VehicleType>('CAR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber.trim()) return;

    setIsSubmitting(true);
    try {
      await api.vehicles.create({
        registrationNumber: regNumber.toUpperCase().trim(),
        vehicleType: type,
      });
      showToast('Vehicle added to your garage!', 'success');
      setRegNumber('');
      setShowAddForm(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register vehicle';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!confirm('Are you sure you want to remove this vehicle from your account?')) return;
    try {
      await api.vehicles.delete(id);
      showToast('Vehicle removed successfully', 'info');
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove vehicle';
      showToast(msg, 'error');
    }
  };

  const getTypeIcon = (vType: VehicleType) => {
    switch (vType) {
      case 'CAR': return <Car size={20} color="#6366f1" />;
      case 'MOTORCYCLE': return <Bike size={20} color="#10b981" />;
      case 'EV': return <Zap size={20} color="#38bdf8" />;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem' }}>My Garage & Registered Vehicles</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Register your cars, bikes, and EVs for swift booking and gate authorization.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} /> Register Vehicle
        </button>
      </div>

      {/* Add vehicle form drawer */}
      {showAddForm && (
        <form
          onSubmit={handleAddVehicle}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            animation: 'fadeIn 200ms ease-out',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Register New Vehicle</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Registration Number / Plate</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. KA-05-MJ-4321"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                required
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Vehicle Type</label>
              <select
                className="input-field"
                value={type}
                onChange={(e) => setType(e.target.value as VehicleType)}
              >
                <option value="CAR">Car</option>
                <option value="MOTORCYCLE">Motorcycle / Scooter</option>
                <option value="EV">Electric Vehicle (EV)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Saving...' : 'Save Vehicle'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
          <Car size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No vehicles registered yet. Add your vehicle to begin booking slots.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getTypeIcon(v.vehicleType)}
                </div>

                <div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }}>
                    {v.registrationNumber}
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>
                    {v.vehicleType}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteVehicle(v.id)}
                className="btn btn-secondary btn-icon"
                title="Remove vehicle"
                style={{ color: '#ef4444' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
