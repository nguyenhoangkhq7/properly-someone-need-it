export type LatLng = { lat: number; lng: number };

type MaybeGeoPoint =
  | { coordinates?: readonly [number, number] | null }
  | null
  | undefined;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const toLatLng = (
  coordinates?: readonly [number, number] | null
): LatLng | null => {
  if (!coordinates || coordinates.length < 2) return null;
  const [lng, lat] = coordinates;
  if (!isFiniteNumber(lat) || !isFiniteNumber(lng)) return null;
  return { lat, lng };
};

export const getUserLatLng = (user?: {
  address?: {
    location?: MaybeGeoPoint;
  } | null;
} | null): LatLng | null => {
  const coords = user?.address?.location?.coordinates ?? null;
  return toLatLng(coords);
};

export const haversineKm = (a: LatLng, b: LatLng): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.asin(Math.min(1, Math.sqrt(h)));
  return R * c;
};

export const roundDistanceKm = (km: number): number =>
  Math.round(km * 10) / 10;

