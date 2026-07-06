import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import { X, MapPin } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  radius: number;
  locationName?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MAP_ZOOM = 15;

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

/** Formats a radius in meters to a human-readable string. */
const formatRadius = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function LocationMapModal({ isOpen, onClose, latitude, longitude, radius, locationName }: LocationMapModalProps) {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Blurred backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">Unlock Location</h3>
                  {locationName && (
                    <p className="text-[11px] text-ink-muted">{locationName}</p>
                  )}
                </div>
              </div>
              <button
                id="location-map-modal-close"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-paper text-ink-muted hover:text-ink transition-colors duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Map */}
            <div style={{ height: '340px' }}>
              <MapContainer
                center={[latitude, longitude]}
                zoom={MAP_ZOOM}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[latitude, longitude]} icon={MARKER_ICON} />
                <Circle
                  center={[latitude, longitude]}
                  radius={radius}
                  pathOptions={{
                    color: '#7A1B2D',
                    fillColor: '#7A1B2D',
                    fillOpacity: 0.12,
                    weight: 2,
                  }}
                />
              </MapContainer>
            </div>

            {/* Footer info */}
            <div className="px-5 py-3 border-t border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
                <span className="text-[11px] text-ink font-medium">
                  📍 {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </span>
              </div>
              <span className="text-[11px] text-ink-muted font-medium">
                Radius: {formatRadius(radius)}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
