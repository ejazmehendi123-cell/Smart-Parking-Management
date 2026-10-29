import React, { useState } from 'react';
import { Accessibility, Bike, Car, CheckCircle2, Clock, Filter, MapPin, Wrench, Zap } from 'lucide-react';
import { ParkingLocation, ParkingSlot, SlotType } from '../types';

interface SlotMapProps {
  locations: ParkingLocation[];
  selectedLocationId: number | null;
  onSelectLocation: (id: number) => void;
  slots: ParkingSlot[];
  onSlotClick: (slot: ParkingSlot) => void;
}

export const SlotMap: React.FC<SlotMapProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
  slots,
  onSlotClick,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const selectedLocation = locations.find((l) => l.id === selectedLocationId) || locations[0];

  // Extract unique floors
  const floors = ['ALL', ...Array.from(new Set(slots.map((s) => s.floor || 'Ground')))];

  // Filter slots
  const filteredSlots = slots.filter((slot) => {
    if (selectedFloor !== 'ALL' && (slot.floor || 'Ground') !== selectedFloor) return false;
    if (selectedType !== 'ALL' && slot.slotType !== selectedType) return false;
    return true;
  });

  const getSlotTypeIcon = (type: SlotType) => {
    switch (type) {
      case 'CAR': return <Car size={18} />;
      case 'MOTORCYCLE': return <Bike size={18} />;
      case 'EV': return <Zap size={18} color="#38bdf8" />;
      case 'ACCESSIBLE': return <Accessibility size={18} color="#f59e0b" />;
    }
  };

  const availableCount = slots.filter((s) => s.status === 'AVAILABLE').length;
  const occupiedCount = slots.filter((s) => s.status === 'OCCUPIED').length;
  const reservedCount = slots.filter((s) => s.status === 'RESERVED').length;

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      {/* Header with location selector & KPI count pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <MapPin size={20} color="#6366f1" />
            <h2 style={{ fontSize: '1.35rem' }}>Live Parking Facility Map</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Select an available bay to reserve your parking spot or view live occupancy.
          </p>
        </div>

        {/* Location selector dropdown */}
        <div style={{ minWidth: '260px' }}>
          <select
            className="input-field"
            value={selectedLocationId || ''}
            onChange={(e) => onSelectLocation(Number(e.target.value))}
            style={{ fontWeight: 600 }}
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                📍 {loc.name} ({loc.availableSlots}/{loc.totalSlots} free)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Facility address & description */}
      {selectedLocation && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
              {selectedLocation.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {selectedLocation.address}
            </div>
          </div>

          {/* Quick counts */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge-available">
              <span className="pulse-dot green" /> {availableCount} Available
            </span>
            <span className="badge badge-occupied">
              <span className="pulse-dot red" /> {occupiedCount} Occupied
            </span>
            <span className="badge badge-reserved">
              <Clock size={12} /> {reservedCount} Reserved
            </span>
          </div>
        </div>
      )}

      {/* Filter Toolbar: Floor pills and Type tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        {/* Floor selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>FLOOR:</span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {floors.map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className="btn btn-sm"
                style={{
                  background: selectedFloor === floor ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: selectedFloor === floor ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border-light)',
                  padding: '0.3rem 0.75rem',
                }}
              >
                {floor}
              </button>
            ))}
          </div>
        </div>

        {/* Slot Type selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>TYPE:</span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {(['ALL', 'CAR', 'MOTORCYCLE', 'EV', 'ACCESSIBLE'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="btn btn-sm"
                style={{
                  background: selectedType === type ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: selectedType === type ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border-light)',
                  padding: '0.3rem 0.75rem',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Slot Grid */}
      {filteredSlots.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-dim)' }}>
          <Filter size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No parking slots match the selected floor/type criteria.</p>
        </div>
      ) : (
        <div className="slot-grid">
          {filteredSlots.map((slot) => {
            const isClickable = slot.status === 'AVAILABLE';

            return (
              <div
                key={slot.id}
                onClick={() => onSlotClick(slot)}
                className={`slot-item status-${slot.status}`}
                style={{
                  cursor: isClickable ? 'pointer' : 'default',
                }}
              >
                {/* Type Icon badge */}
                <div
                  style={{
                    color:
                      slot.status === 'AVAILABLE'
                        ? '#10b981'
                        : slot.status === 'OCCUPIED'
                        ? '#ef4444'
                        : slot.status === 'RESERVED'
                        ? '#f59e0b'
                        : '#94a3b8',
                  }}
                >
                  {getSlotTypeIcon(slot.slotType)}
                </div>

                {/* Slot Number */}
                <div className="slot-number">{slot.slotNumber}</div>

                {/* Status Pill */}
                <span className={`badge badge-${slot.status.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                  {slot.status}
                </span>

                {/* Floor detail */}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {slot.floor || 'Ground'} • {slot.slotType}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
