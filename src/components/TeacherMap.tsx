import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_TILE_URL, MAP_TILE_ATTRIBUTION, MAP_DEFAULT_CENTER } from '../lib/maps';
import type { SkillWithTeacher } from '../types';

// Brand teardrop pin as an inline SVG divIcon (avoids broken default-marker assets).
function pinIcon(color: string) {
  return L.divIcon({
    className: 'skill-pin',
    html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10 15 25 15 25s15-15 15-25C30 6.7 23.3 0 15 0z" fill="${color}"/>
      <circle cx="15" cy="15" r="6" fill="white"/></svg>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -38],
  });
}

const TEACHER_PIN = pinIcon('#16A34A');

// Keep the map centred on the active point when it changes.
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng]); }, [lat, lng, map]);
  return null;
}

interface Props {
  skills: SkillWithTeacher[];
  userLat?: number | null;
  userLng?: number | null;
  height?: number;
  onSelect?: (skillId: string) => void;
}

export default function TeacherMap({ skills, userLat, userLng, height = 280, onSelect }: Props) {
  const pinned = useMemo(
    () => skills.filter((s) => s.location_lat != null && s.location_lng != null),
    [skills],
  );

  const hasUser = userLat != null && userLng != null;

  // Centre priority: the user's real position → the teacher pins' centroid →
  // a neutral India-wide view. We never invent a user location.
  const center: [number, number] = hasUser
    ? [userLat as number, userLng as number]
    : pinned.length
      ? [pinned.reduce((s, p) => s + (p.location_lat as number), 0) / pinned.length,
         pinned.reduce((s, p) => s + (p.location_lng as number), 0) / pinned.length]
      : [MAP_DEFAULT_CENTER.lat, MAP_DEFAULT_CENTER.lng];
  const zoom = hasUser || pinned.length ? 12 : 5;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height, width: '100%' }}
      >
        <TileLayer url={MAP_TILE_URL} attribution={MAP_TILE_ATTRIBUTION} />
        <Recenter lat={center[0]} lng={center[1]} />

        {/* Learner location — only when we have a real fix */}
        {hasUser && (
          <CircleMarker
            center={[userLat as number, userLng as number]}
            radius={7}
            pathOptions={{ color: '#2563EB', fillColor: '#3B82F6', fillOpacity: 1, weight: 3 }}
          >
            <Popup>You are here</Popup>
          </CircleMarker>
        )}

        {/* Teacher pins */}
        {pinned.map((s) => (
          <Marker
            key={s.id}
            position={[s.location_lat as number, s.location_lng as number]}
            icon={TEACHER_PIN}
            eventHandlers={onSelect ? { click: () => onSelect(s.id) } : undefined}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong>{s.title}</strong>
                <div style={{ color: '#6B7280', fontSize: 12 }}>{s.teacher_name}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  ₹{s.price_per_session} / session
                  {s.distance_km != null && <> · {s.distance_km.toFixed(1)} km</>}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
