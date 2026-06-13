import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin } from 'lucide-react';
import { MAP_TILE_URL, MAP_TILE_ATTRIBUTION, MAP_DEFAULT_CENTER } from '../lib/maps';

const PIN = L.divIcon({
  className: 'skill-pin',
  html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 10 15 25 15 25s15-15 15-25C30 6.7 23.3 0 15 0z" fill="#16A34A"/>
    <circle cx="15" cy="15" r="6" fill="white"/></svg>`,
  iconSize: [30, 40], iconAnchor: [15, 40],
});

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  return <RecenterInner map={map} lat={lat} lng={lng} />;
}
function RecenterInner({ map, lat, lng }: { map: L.Map; lat: number; lng: number }) {
  map.setView([lat, lng]);
  return null;
}

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number, name?: string) => void;
}

export default function LocationPicker({ lat, lng, onChange }: Props) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const curLat = lat ?? MAP_DEFAULT_CENTER.lat;
  const curLng = lng ?? MAP_DEFAULT_CENTER.lng;

  // OpenStreetMap Nominatim geocoding (keyless).
  const geocode = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        { headers: { 'Accept-Language': 'en' } },
      );
      const hits = await res.json();
      if (hits[0]) onChange(parseFloat(hits[0].lat), parseFloat(hits[0].lon), hits[0].display_name?.split(',').slice(0, 2).join(', '));
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-2" style={{ border: '1.5px solid #E5E7EB' }}>
        <Search size={15} className="text-gray-400 flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); geocode(); } }}
          placeholder="Search an address or area…"
          className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400 min-w-0" />
        <button type="button" onClick={geocode} disabled={searching}
          className="text-xs font-semibold text-green-700 flex-shrink-0">
          {searching ? '…' : 'Find'}
        </button>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <MapContainer center={[curLat, curLng]} zoom={14} style={{ height: 220, width: '100%' }}>
          <TileLayer url={MAP_TILE_URL} attribution={MAP_TILE_ATTRIBUTION} />
          <Recenter lat={curLat} lng={curLng} />
          <ClickToPlace onPick={(la, ln) => onChange(la, ln)} />
          {lat != null && lng != null && (
            <Marker
              position={[lat, lng]}
              icon={PIN}
              draggable
              eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); onChange(p.lat, p.lng); } }}
            />
          )}
        </MapContainer>
      </div>
      <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
        <MapPin size={11} /> Tap the map or drag the pin to set your exact teaching location.
      </p>
    </div>
  );
}
