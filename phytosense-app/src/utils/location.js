import * as Location from 'expo-location';

// Returns { lat, lon } or null if permission is denied / unavailable.
export async function getCoords() {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) return null;
    const pos = await Location.getCurrentPositionAsync({});
    return { lat: pos.coords.latitude, lon: pos.coords.longitude };
  } catch {
    return null;
  }
}
