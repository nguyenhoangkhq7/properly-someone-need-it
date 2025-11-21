import type { ItemLocation } from "../types/Item";

// Lazy-load expo-location to avoid crashes if the native module is missing
let LocationModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  LocationModule = require("expo-location");
} catch (_e) {
  LocationModule = null;
}

const formatAddress = (addr: any) => {
  const parts = [
    [addr.street, addr.name].filter(Boolean).join(" ").trim(),
    addr.subregion || addr.city,
    addr.district,
    addr.region,
    addr.country,
  ]
    .filter(Boolean)
    .map((p: string) => String(p).trim());
  return parts.join(", ");
};

const FALLBACK_TEXT = "Khong ro dia diem";

// Cache resolved labels so we don't reverse-geocode the same coordinate repeatedly
const labelCache = new Map<string, string>();
const pendingCache = new Map<string, Promise<string>>();

const fallbackFromCoords = (location?: ItemLocation) => {
  if (!location?.coordinates?.length) return FALLBACK_TEXT;
  // Avoid showing raw coordinates to users; keep a generic placeholder instead.
  return FALLBACK_TEXT;
};

export async function getLocationLabelAsync(
  location?: ItemLocation
): Promise<string> {
  if (!location?.coordinates || location.coordinates.length < 2) {
    return FALLBACK_TEXT;
  }

  const [lng, lat] = location.coordinates;
  const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;

  if (labelCache.has(cacheKey)) {
    return labelCache.get(cacheKey)!;
  }
  if (pendingCache.has(cacheKey)) {
    return pendingCache.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    if (!LocationModule?.reverseGeocodeAsync) {
      const fb = fallbackFromCoords(location);
      labelCache.set(cacheKey, fb);
      return fb;
    }

    try {
      if (LocationModule.requestForegroundPermissionsAsync) {
        await LocationModule.requestForegroundPermissionsAsync().catch(() => {});
      }

      const results = await LocationModule.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (results?.length) {
        const addr = formatAddress(results[0]);
        if (addr) {
          labelCache.set(cacheKey, addr);
          return addr;
        }
      }
      const fb = fallbackFromCoords(location);
      labelCache.set(cacheKey, fb);
      return fb;
    } catch (_e) {
      const fb = fallbackFromCoords(location);
      labelCache.set(cacheKey, fb);
      return fb;
    } finally {
      pendingCache.delete(cacheKey);
    }
  })();

  pendingCache.set(cacheKey, fetchPromise);
  return fetchPromise;
}

// Sync helper: return cached label if available, otherwise the coordinate fallback
export function getLocationLabel(location?: ItemLocation): string {
  if (!location?.coordinates || location.coordinates.length < 2) {
    return FALLBACK_TEXT;
  }
  const [lng, lat] = location.coordinates;
  const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  if (labelCache.has(cacheKey)) {
    return labelCache.get(cacheKey)!;
  }
  // If we don't have a resolved label yet, return a neutral placeholder
  return FALLBACK_TEXT;
}
