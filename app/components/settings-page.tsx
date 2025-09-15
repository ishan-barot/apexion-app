

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react'
import ThemeCustomizer from '@/components/settings/theme-customizer'
import { ThemeConfig, NotificationConfig, CelebrationConfig } from '@/lib/types'

export default function SettingsPage() {
  const router = useRouter()
  
  // Default configurations
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    mode: 'system',
    primaryColor: '#3b82f6',
    backgroundImage: '',
    customColors: {
      primary: '#3b82f6',
      secondary: '#e0e7ff',
      accent: '#6366f1'
    }
  })

  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>({
    enabled: true,
    browser: true,
    sound: true,
    types: {
      taskReminder: true,
      timerComplete: true,
      achievements: true,
      dailyGoals: true
    }
  })

  const [celebrationConfig, setCelebrationConfig] = useState<CelebrationConfig>({
    enabled: true,
    soundEnabled: true,
    animationEnabled: true,
    achievements: true
  })

  // Load saved configurations on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load theme config
      const savedTheme = localStorage.getItem('focusflow-theme-config')
      if (savedTheme) {
        try {
          setThemeConfig(JSON.parse(savedTheme))
        } catch (e) {
          console.error('Error loading theme config:', e)
        }
      }

      // Load notification config
      const savedNotifications = localStorage.getItem('focusflow-notification-config')
      if (savedNotifications) {
        try {
          setNotificationConfig(JSON.parse(savedNotifications))
        } catch (e) {
          console.error('Error loading notification config:', e)
        }
      }

      // Load celebration config
      const savedCelebrations = localStorage.getItem('focusflow-celebration-config')
      if (savedCelebrations) {
        try {
          setCelebrationConfig(JSON.parse(savedCelebrations))
        } catch (e) {
          console.error('Error loading celebration config:', e)
        }
      }
    }
  }, [])

  const handleThemeChange = (config: ThemeConfig) => {
    setThemeConfig(config)
    if (typeof window !== 'undefined') {
      localStorage.setItem('focusflow-theme-config', JSON.stringify(config))
    }
  }

  const handleNotificationChange = (config: NotificationConfig) => {
    setNotificationConfig(config)
    if (typeof window !== 'undefined') {
      localStorage.setItem('focusflow-notification-config', JSON.stringify(config))
      
      // Request notification permission if enabled
      if (config.enabled && config.browser && 'Notification' in window) {
        Notification.requestPermission()
      }
    }
  }

  const handleCelebrationChange = (config: CelebrationConfig) => {
    setCelebrationConfig(config)
    if (typeof window !== 'undefined') {
      localStorage.setItem('focusflow-celebration-config', JSON.stringify(config))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <SettingsIcon className="h-6 w-6" />
                  Settings
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Customize your Apexion experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Theme Customizer */}
          <div className="flex justify-center">
            <ThemeCustomizer
              themeConfig={themeConfig}
              notificationConfig={notificationConfig}
              celebrationConfig={celebrationConfig}
              onThemeChange={handleThemeChange}
              onNotificationChange={handleNotificationChange}
              onCelebrationChange={handleCelebrationChange}
            />
          </div>

          {/* Additional Settings Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data & Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Your data is stored locally and never shared with third parties.</p>
                  <p className="mt-2">All customizations are saved in your browser's local storage.</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all settings? This cannot be undone.')) {
                        localStorage.clear()
                        window.location.reload()
                      }
                    }}
                  >
                    Clear All Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>App Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Version:</strong> 2.0.0</p>
                  <p><strong>Last Updated:</strong> September 2025</p>
                  <p><strong>Features:</strong> Task Management, Pomodoro Timer, Analytics, Color Customization</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
