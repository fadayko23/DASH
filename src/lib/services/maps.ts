export async function geocodeAddress(address: string): Promise<{ lat: number, lng: number } | null> {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.warn('GOOGLE_MAPS_API_KEY not missing, using mock coordinates')
      return { lat: 34.0522, lng: -118.2437 } // LA coordinates
  }

  try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`)
      const data = await res.json()
      if (data.status === 'OK' && data.results.length > 0) {
          return data.results[0].geometry.location
      }
      return null
  } catch (e) {
      console.error('Geocoding error', e)
      return null
  }
}
