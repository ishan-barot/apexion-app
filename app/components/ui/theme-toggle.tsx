
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    // Simple toggle between light and dark
    if (resolvedTheme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  if (!mounted) {
    return (
      <Button 
        variant="outline" 
        size="icon" 
        className="w-9 h-9"
        disabled
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only">toggle theme</span>
      </Button>
    )
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="w-9 h-9"
      onClick={toggleTheme}
      title={`Current theme: ${resolvedTheme}. Click to toggle theme.`}
    >
      {resolvedTheme === 'light' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">toggle theme</span>
    </Button>
  )
}
