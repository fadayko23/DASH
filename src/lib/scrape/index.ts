import OpenAI from 'openai'
import * as cheerio from 'cheerio'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
})

export type NormalizedProductData = {
  name: string
  description?: string
  baseSku?: string
  vendorName?: string
  imageUrl?: string
  specs?: Record<string, string>
}

export async function scrapeProductPage(url: string): Promise<NormalizedProductData> {
  // 1. Fetch HTML (Basic fetch for MVP, robust apps use proxies/headless browsers)
  const res = await fetch(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DashBot/1.0)' } 
  })
  
  if (!res.ok) {
      throw new Error(`Failed to fetch URL: ${res.status}`)
  }
  
  const html = await res.text()
  const $ = cheerio.load(html)

  // Remove scripts and styles to reduce token count
  $('script').remove()
  $('style').remove()
  
  const cleanText = $('body').text().replace(/\s+/g, ' ').substring(0, 6000) // Truncate for context limit

  // 2. Use OpenAI to parse if key is valid
  if (process.env.OPENAI_API_KEY) {
      try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a product scraper helper. Extract product details from the provided HTML text. Return valid JSON only." },
                { role: "user", content: `Extract JSON with keys: name, description, baseSku, vendorName, imageUrl (absolute url), specs (key-value pairs). Text: ${cleanText}` }
            ],
            model: "gpt-3.5-turbo-1106",
            response_format: { type: "json_object" },
        })

        const content = completion.choices[0].message.content
        if (content) {
            return JSON.parse(content) as NormalizedProductData
        }
      } catch (e) {
          console.error("OpenAI extraction failed, falling back to heuristics", e)
      }
  } else {
      console.warn("Missing OPENAI_API_KEY, returning mock data")
  }

  // 3. Fallback / Mock (if no API key or AI fail)
  // Simple metadata extraction
  const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Unknown Product'
  const image = $('meta[property="og:image"]').attr('content') || ''
  const description = $('meta[property="og:description"]').attr('content') || ''
  
  return {
      name: title.trim(),
      description: description.trim(),
      imageUrl: image,
      vendorName: new URL(url).hostname.replace('www.', ''),
      specs: {}
  }
}

export async function scrapeListPage(url: string): Promise<string[]> {
   // MVP: Returns mock list or simple link extraction if AI is off
   // Real impl would use AI to identify product links vs nav links
   
   const res = await fetch(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DashBot/1.0)' } 
  })
  if (!res.ok) throw new Error(`Failed to fetch list: ${res.status}`)
      
  const html = await res.text()
  const $ = cheerio.load(html)
  
  const links = new Set<string>()
  $('a[href]').each((_, el) => {
      const href = $(el).attr('href')
      if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
          // Simple heuristic: links containing 'product' or 'item' or typical catalog patterns
          // This is very naive for MVP.
          try {
             const fullUrl = new URL(href, url).toString()
             links.add(fullUrl)
          } catch {}
      }
  })

  // If OpenAI available, we could filter these links intelligently.
  // For MVP, just return first 5 unique links to avoid spamming in dev.
  return Array.from(links).slice(0, 5) 
}
