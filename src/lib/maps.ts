// OpenStreetMap tile configuration.
// Defaults to the keyless public OSM tile server (fine for dev). To use a
// provider that needs a key (MapTiler, Stadia, Thunderforest…), set the env
// vars below — put {key} where the key goes in the URL template.
//   VITE_MAP_TILE_URL=https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key={key}
//   VITE_MAP_TILE_API_KEY=your-key
//   VITE_MAP_TILE_ATTRIBUTION=...

// CARTO "Voyager" — a clean, modern style over current OpenStreetMap data.
// Keyless and free for reasonable use; swap via the env vars for a keyed provider.
const DEFAULT_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const DEFAULT_ATTRIBUTION = '&copy; OpenStreetMap contributors &copy; CARTO';

const rawUrl = (import.meta.env.VITE_MAP_TILE_URL as string) || DEFAULT_URL;
const apiKey = (import.meta.env.VITE_MAP_TILE_API_KEY as string) || '';

export const MAP_TILE_URL = rawUrl.replace('{key}', apiKey);
export const MAP_TILE_ATTRIBUTION =
  (import.meta.env.VITE_MAP_TILE_ATTRIBUTION as string) || DEFAULT_ATTRIBUTION;

// Neutral map viewport used ONLY when there is no real position to show
// (centre of India). This is never presented as the user's location.
export const MAP_DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
