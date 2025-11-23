export async function getPropertyDetails(address: string): Promise<{ imageUrl?: string, beds?: number, baths?: number, sqft?: number, raw?: unknown }> {
  if (!process.env.ZILLOW_API_KEY && !process.env.BRIDGE_API_KEY) {
      // Mock response if no key
      return {
          imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
          beds: 4,
          baths: 3,
          sqft: 2500,
          raw: { zestimate: 1200000 }
      }
  }

  // Real implementation would go here (e.g. using Bridge API or Zillow API via RapidAPI)
  // For MVP, we stick to the mock or simple fetch
  return {}
}
