'use client'

import { useEffect } from 'react'

type Theme = {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  bgColor: string
  textColor: string
  fontFamily: string
  borderRadius: string
  shadowPreset: string
}

export function ThemeProvider({ theme }: { theme: Theme | null }) {
  useEffect(() => {
    if (!theme) return

    const root = document.documentElement

    root.style.setProperty('--primary', theme.primaryColor)
    root.style.setProperty('--secondary', theme.secondaryColor)
    root.style.setProperty('--accent', theme.accentColor)
    root.style.setProperty('--background', theme.bgColor)
    root.style.setProperty('--foreground', theme.textColor)
    root.style.setProperty('--font-sans', theme.fontFamily === 'serif' ? 'serif' : theme.fontFamily === 'mono' ? 'monospace' : 'sans-serif') // Simplified mapping
    
    // Convert hex/values if necessary for Tailwind alpha opacity vars if using variable based colors which we are.
    // But our globals.css uses hex directly. Tailwind 4 might handle it differently, or we need to use rgb.
    // For now, assuming direct hex assignment works with the variable definitions in globals.css which map to --color-primary etc.
    
    root.style.setProperty('--radius', theme.borderRadius)
    // Shadow handling might need a more complex map if "sm", "md", "lg" are the presets.
    // For now, ignoring shadowPreset direct CSS var mapping unless we define --shadow-custom.
    
  }, [theme])

  return null
}
