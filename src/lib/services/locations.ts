// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { geocodeAddress } from './maps'

export async function findNearestLocation(
  tenantLocations: { lat: number; lng: number; id: string }[], 
  targetLat: number, 
  targetLng: number
): Promise<string | null> {
  if (tenantLocations.length === 0) return null

  let nearestId = null
  let minDistance = Infinity

  for (const loc of tenantLocations) {
      const dist = getDistanceFromLatLonInKm(targetLat, targetLng, loc.lat, loc.lng)
      if (dist < minDistance) {
          minDistance = dist
          nearestId = loc.id
      }
  }

  return nearestId
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);  // deg2rad below
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}
