import {
  createContext, useContext, useCallback, useEffect, useState, type ReactNode,
} from 'react';

type Status = 'idle' | 'locating' | 'granted' | 'denied' | 'unsupported';
type Permission = 'granted' | 'prompt' | 'denied' | 'unknown';

export interface GeoState {
  lat: number | null;        // null until we have a real fix — no fake fallback
  lng: number | null;
  name: string | null;
  status: Status;
  permission: Permission;
  locate: () => void;
}

// Coordinates → human area name via keyless OSM Nominatim.
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&zoom=14&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en' } },
    );
    const a = (await res.json())?.address ?? {};
    return a.suburb || a.neighbourhood || a.village || a.town || a.city_district || a.city || a.state || 'Your location';
  } catch {
    return 'Your location';
  }
}

const GeoContext = createContext<GeoState | null>(null);

export function GeolocationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<GeoState, 'locate' | 'permission'>>({
    lat: null, lng: null, name: null, status: 'idle',
  });
  const [permission, setPermission] = useState<Permission>('unknown');

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({ lat: null, lng: null, name: null, status: 'unsupported' });
      return;
    }
    setState((s) => ({ ...s, status: 'locating' }));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setPermission('granted');
        setState({ lat, lng, name: 'Your location', status: 'granted' });
        const name = await reverseGeocode(lat, lng);
        setState({ lat, lng, name, status: 'granted' });
      },
      () => { setPermission('denied'); setState({ lat: null, lng: null, name: null, status: 'denied' }); },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },  // maximumAge 0 = always a fresh read
    );
  }, []);

  // Track permission state; if already granted, pinpoint silently on load.
  useEffect(() => {
    let active = true;
    const perms = navigator.permissions;
    if (perms?.query) {
      perms.query({ name: 'geolocation' as PermissionName }).then((res) => {
        if (!active) return;
        setPermission(res.state as Permission);
        if (res.state === 'granted') locate();
        res.onchange = () => setPermission(res.state as Permission);
      }).catch(() => { /* no Permissions API → leave as 'unknown' */ });
    }
    return () => { active = false; };
  }, [locate]);

  return (
    <GeoContext.Provider value={{ ...state, permission, locate }}>
      {children}
    </GeoContext.Provider>
  );
}

export function useGeolocation(): GeoState {
  const ctx = useContext(GeoContext);
  if (!ctx) throw new Error('useGeolocation must be used inside <GeolocationProvider>');
  return ctx;
}
