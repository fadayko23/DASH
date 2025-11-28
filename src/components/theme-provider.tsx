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
    const root = document.documentElement
    
    // Default theme values
    const defaultTheme = {
      primaryColor: "#3b82f6",
      secondaryColor: "#f1f5f9",
      accentColor: "#f1f5f9",
      bgColor: "#ffffff",
      textColor: "#171717",
      fontFamily: "Montserrat",
      borderRadius: "0.5rem"
    }

    const activeTheme = theme || defaultTheme

    root.style.setProperty('--primary', activeTheme.primaryColor)
    root.style.setProperty('--secondary', activeTheme.secondaryColor)
    root.style.setProperty('--accent', activeTheme.accentColor)
    root.style.setProperty('--background', activeTheme.bgColor)
    root.style.setProperty('--foreground', activeTheme.textColor)
    
    const getFontFamily = (font: string) => {
        if (!font || font === 'Montserrat' || font === 'montserrat') {
          return 'var(--font-montserrat), system-ui, sans-serif'
        }
        if (font === 'serif') return 'serif'
        if (font === 'mono') return 'monospace'
        if (font === 'sans' || font === 'sans-serif') {
          return 'var(--font-montserrat), system-ui, sans-serif'
        }
        return `"${font}", var(--font-montserrat), system-ui, sans-serif`
    }
    
    const fontFamily = getFontFamily(activeTheme.fontFamily)
    root.style.setProperty('--font-sans', fontFamily)
    document.body.style.fontFamily = fontFamily
    
    root.style.setProperty('--radius', activeTheme.borderRadius)
    
  }, [theme])

  return null
}
