import type { ItemLocation } from "../types/Item";

// Try to load expo-location dynamically to avoid import errors when the module is absent.
let LocationModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  LocationModule = require("expo-location");
} catch (_e) {
  LocationModule = null;
}

const formatAddress = (addr: any) => {
  // Ưu tiên các trường phổ biến từ reverse geocode của expo-location
  const parts = [
    [addr.street, addr.name].filter(Boolean).join(" ").trim(),
    addr.city || addr.subregion,
    addr.district,
    addr.region,
    addr.country,
  ]
    .filter(Boolean)
    .map((p: string) => p.trim());
  return parts.join(", ").normalize("NFC");
};

const fallbackFromCoords = (location?: ItemLocation) => {
  if (!location?.coordinates?.length) return "Không rõ địa điểm";
  const [lng, lat] = location.coordinates;
  return `Vị trí gần: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

export async function getLocationLabelAsync(
  location?: ItemLocation
): Promise<string> {
  if (!location?.coordinates || location.coordinates.length < 2) {
    return "Không rõ địa điểm";
  }

  const [lng, lat] = location.coordinates;
  try {
    if (!LocationModule || !LocationModule.reverseGeocodeAsync) {
      return fallbackFromCoords(location);
    }

    const results = await LocationModule.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });

    if (results && results.length > 0) {
      const addr = formatAddress(results[0]);
      if (addr) return addr;
    }
    return fallbackFromCoords(location);
  } catch (e) {
    return fallbackFromCoords(location);
  }
}

// Sync fallback (kept for places still using it synchronously)
export function getLocationLabel(location?: ItemLocation): string {
  return fallbackFromCoords(location);
}
