

// Theme manager for handling dynamic color schemes
export interface ColorScheme {
  id: string
  name: string
  primary: string
  secondary: string
  background: string
  foreground: string
  accent: string
  muted: string
  cardBackground: string
  headerBackground: string
  borderColor: string
  isDark?: boolean
}

export const defaultColorSchemes: ColorScheme[] = [
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    primary: '#0ea5e9',
    secondary: '#bae6fd',
    background: '#f0f9ff',
    foreground: '#0c4a6e',
    accent: '#0284c7',
    muted: '#e0f2fe',
    cardBackground: '#ffffff',
    headerBackground: '#ffffff',
    borderColor: '#bae6fd',
    isDark: false
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    primary: '#10b981',
    secondary: '#a7f3d0',
    background: '#f0fdf4',
    foreground: '#064e3b',
    accent: '#059669',
    muted: '#d1fae5',
    cardBackground: '#ffffff',
    headerBackground: '#ffffff',
    borderColor: '#a7f3d0',
    isDark: false
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    primary: '#f59e0b',
    secondary: '#fed7aa',
    background: '#fffbeb',
    foreground: '#92400e',
    accent: '#d97706',
    muted: '#fef3c7',
    cardBackground: '#ffffff',
    headerBackground: '#ffffff',
    borderColor: '#fed7aa',
    isDark: false
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    primary: '#8b5cf6',
    secondary: '#ddd6fe',
    background: '#faf5ff',
    foreground: '#581c87',
    accent: '#7c3aed',
    muted: '#ede9fe',
    cardBackground: '#ffffff',
    headerBackground: '#ffffff',
    borderColor: '#ddd6fe',
    isDark: false
  },
  {
    id: 'rose-pink',
    name: 'Rose Pink',
    primary: '#ec4899',
    secondary: '#fbcfe8',
    background: '#fdf2f8',
    foreground: '#831843',
    accent: '#db2777',
    muted: '#fce7f3',
    cardBackground: '#ffffff',
    headerBackground: '#ffffff',
    borderColor: '#fbcfe8',
    isDark: false
  },
  {
    id: 'midnight-dark',
    name: 'Midnight Dark',
    primary: '#6366f1',
    secondary: '#4338ca',
    background: '#0f172a',
    foreground: '#f1f5f9',
    accent: '#818cf8',
    muted: '#1e293b',
    cardBackground: '#1e293b',
    headerBackground: '#334155',
    borderColor: '#475569',
    isDark: true
  }
]

export function hexToHsl(hex: string): string {
  // Validate hex input
  if (!hex || typeof hex !== 'string') {
    console.warn('Invalid hex color provided to hexToHsl:', hex)
    return '0 0% 50%' // Return neutral gray as fallback
  }
  
  // Ensure hex starts with # and is valid length
  const cleanHex = hex.startsWith('#') ? hex : `#${hex}`
  if (cleanHex.length !== 7) {
    console.warn('Invalid hex color length:', hex)
    return '0 0% 50%' // Return neutral gray as fallback
  }

  const r = parseInt(cleanHex.slice(1, 3), 16) / 255
  const g = parseInt(cleanHex.slice(3, 5), 16) / 255
  const b = parseInt(cleanHex.slice(5, 7), 16) / 255

  // Validate parsed values
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    console.warn('Invalid hex color values:', hex)
    return '0 0% 50%' // Return neutral gray as fallback
  }

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function resetToStandardTheme() {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const body = document.body

  // Remove dynamic theme class
  body.classList.remove('dynamic-theme')
  
  // Clear inline styles
  body.style.backgroundColor = ''
  body.style.color = ''
  
  // Remove custom CSS variables (reset to defaults in globals.css)
  root.style.removeProperty('--theme-background')
  root.style.removeProperty('--theme-foreground')
  root.style.removeProperty('--theme-card-bg')
  root.style.removeProperty('--theme-primary')
  root.style.removeProperty('--theme-accent')
  root.style.removeProperty('--theme-border')
  
  // Remove dynamic theme styles
  const existingStyle = document.getElementById('dynamic-theme-style')
  if (existingStyle) {
    existingStyle.remove()
  }
  
  // Clear localStorage
  localStorage.removeItem('focusflow-color-scheme')
  
  console.log('Reset to standard theme system')
}

export function applyColorScheme(scheme: ColorScheme) {
  if (!scheme || typeof scheme !== 'object') {
    console.warn('Invalid color scheme provided:', scheme)
    return
  }

  if (typeof document === 'undefined') {
    console.warn('applyColorScheme called on server side')
    return
  }

  const root = document.documentElement
  const body = document.body
  
  console.log('Applying color scheme:', scheme.name, scheme)
  
  try {
    // Set CSS custom properties for shadcn components (overrides both light and dark)
    root.style.setProperty('--primary', hexToHsl(scheme.primary))
    root.style.setProperty('--secondary', hexToHsl(scheme.secondary))
    root.style.setProperty('--background', hexToHsl(scheme.background))
    root.style.setProperty('--foreground', hexToHsl(scheme.foreground))
    root.style.setProperty('--accent', hexToHsl(scheme.accent))
    root.style.setProperty('--muted', hexToHsl(scheme.muted))
    root.style.setProperty('--card', hexToHsl(scheme.cardBackground))
    root.style.setProperty('--card-foreground', hexToHsl(scheme.foreground))
    root.style.setProperty('--border', hexToHsl(scheme.borderColor))
    
    // Set theme variables for direct hex usage
    root.style.setProperty('--theme-background', scheme.background)
    root.style.setProperty('--theme-foreground', scheme.foreground)
    root.style.setProperty('--theme-card-bg', scheme.cardBackground)
    root.style.setProperty('--theme-primary', scheme.primary)
    root.style.setProperty('--theme-accent', scheme.accent)
    root.style.setProperty('--theme-border', scheme.borderColor)
    root.style.setProperty('--theme-header-bg', scheme.headerBackground || scheme.cardBackground)
    root.style.setProperty('--theme-muted', scheme.muted)
    
    // Apply colors directly to body
    body.style.backgroundColor = scheme.background
    body.style.color = scheme.foreground
    
    // Add theme class to activate custom styles
    body.classList.remove('dynamic-theme')
    body.classList.add('dynamic-theme')
    
    // Store in localStorage
    localStorage.setItem('focusflow-color-scheme', JSON.stringify(scheme))
    
    console.log('Color scheme applied successfully:', scheme.name)
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('color-scheme-changed', { detail: scheme }))
    
  } catch (error) {
    console.error('Error applying color scheme:', error)
  }
}

export function loadColorScheme(): ColorScheme | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem('focusflow-color-scheme')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Validate that the parsed object has the required properties
      if (parsed && typeof parsed === 'object' && parsed.primary && parsed.background) {
        return parsed
      }
    }
  } catch (error) {
    console.warn('Error loading color scheme from localStorage:', error)
    // Clear invalid data
    localStorage.removeItem('focusflow-color-scheme')
  }
  
  return null
}
