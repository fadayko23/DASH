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
    
    const getFontFamily = (font: string) => {
        if (!font) return 'inherit'
        if (font === 'serif') return 'serif'
        if (font === 'mono') return 'monospace'
        if (font === 'sans') return 'sans-serif'
        return `"${font}", sans-serif`
    }
    root.style.setProperty('--font-sans', getFontFamily(theme.fontFamily))
    
    root.style.setProperty('--radius', theme.borderRadius)
    
  }, [theme])

  return null
}
