import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LocationData {
  latitude: number;
  longitude: number;
  radius: number;
  locationName?: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // India center
const DEFAULT_ZOOM = 5;
const SELECTED_ZOOM = 14;

const MIN_RADIUS_METERS = 100;
const MAX_RADIUS_METERS = 5000;
const DEFAULT_RADIUS_METERS = 500;

// Leaflet's default icon URLs break with bundlers — use CDN paths
const MARKER_ICON = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ── Map Click Handler ─────────────────────────────────────────────────────────

interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click(event) {
      onMapClick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

// ── Radius Label ──────────────────────────────────────────────────────────────

/** Formats a radius in meters to a human-readable string. */
const formatRadius = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.latitude, initialLocation.longitude] : null
  );
  const [radius, setRadius] = useState(initialLocation?.radius ?? DEFAULT_RADIUS_METERS);
  const [mapCenter] = useState<[number, number]>(
    initialLocation ? [initialLocation.latitude, initialLocation.longitude] : DEFAULT_CENTER
  );
  const [mapZoom] = useState(initialLocation ? SELECTED_ZOOM : DEFAULT_ZOOM);

  // Notify parent whenever position or radius changes
  const notifyParent = useCallback(
    (position: [number, number], currentRadius: number) => {
      onLocationSelect({
        latitude: position[0],
        longitude: position[1],
        radius: currentRadius,
      });
    },
    [onLocationSelect]
  );

  // Update parent when radius changes (and position is set)
  useEffect(() => {
    if (selectedPosition) {
      notifyParent(selectedPosition, radius);
    }
  }, [radius]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMapClick = (lat: number, lng: number) => {
    const position: [number, number] = [lat, lng];
    setSelectedPosition(position);
    notifyParent(position, radius);
  };

  const handleRadiusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRadius(Number(event.target.value));
  };

  return (
    <div className="space-y-3">
      {/* Map container */}
      <div className="rounded-xl overflow-hidden border border-black/5 relative" style={{ height: '260px' }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onMapClick={handleMapClick} />

          {selectedPosition && (
            <>
              <Marker position={selectedPosition} icon={MARKER_ICON} />
              <Circle
                center={selectedPosition}
                radius={radius}
                pathOptions={{
                  color: '#7A1B2D',
                  fillColor: '#7A1B2D',
                  fillOpacity: 0.12,
                  weight: 2,
                }}
              />
            </>
          )}
        </MapContainer>

        {/* Instruction overlay when no pin is placed */}
        {!selectedPosition && (
          <div className="absolute inset-0 z-[400] flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-sm border border-black/5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand" />
              <span className="text-xs font-medium text-ink">Click on the map to set the unlock location</span>
            </div>
          </div>
        )}
      </div>

      {/* Radius slider */}
      <div className="bg-paper rounded-xl border border-black/5 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] uppercase font-semibold tracking-wider text-ink-muted">
            Unlock Radius
          </label>
          <span className="text-xs font-semibold text-brand">
            {formatRadius(radius)}
          </span>
        </div>
        <input
          type="range"
          min={MIN_RADIUS_METERS}
          max={MAX_RADIUS_METERS}
          step={50}
          value={radius}
          onChange={handleRadiusChange}
          className={cn(
            "w-full h-1.5 rounded-full appearance-none cursor-pointer",
            "bg-black/8 accent-brand"
          )}
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-ink-muted">{formatRadius(MIN_RADIUS_METERS)}</span>
          <span className="text-[10px] text-ink-muted">{formatRadius(MAX_RADIUS_METERS)}</span>
        </div>
      </div>

      {/* Selected coordinates display */}
      {selectedPosition && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-soft/40 border border-brand/10">
          <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
          <span className="text-[11px] text-ink font-medium truncate">
            📍 {selectedPosition[0].toFixed(5)}, {selectedPosition[1].toFixed(5)}
          </span>
        </div>
      )}
    </div>
  );
}
