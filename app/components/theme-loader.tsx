
'use client'

import { useEffect } from 'react'
import { loadColorScheme, applyColorScheme } from '@/lib/theme-manager'

export default function ThemeLoader() {
  useEffect(() => {
    try {
      // Only load saved color scheme if user has customized colors
      const savedScheme = loadColorScheme()
      if (savedScheme) {
        console.log('Applying saved custom color scheme:', savedScheme.name || savedScheme.id)
        applyColorScheme(savedScheme)
      } else {
        console.log('No custom color scheme found, using standard dark/light mode')
        // Don't apply any dynamic theme - let next-themes handle it
        // Remove dynamic theme class if it exists
        if (typeof document !== 'undefined') {
          document.body.classList.remove('dynamic-theme')
        }
      }
    } catch (error) {
      console.error('Error in ThemeLoader:', error)
      // Don't apply fallback theme - let standard theme system work
      if (typeof document !== 'undefined') {
        document.body.classList.remove('dynamic-theme')
      }
    }
  }, [])

  return null // This component only loads the theme, doesn't render anything
}
