

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ColorPicker } from '@/components/ui/color-picker'
import { 
  Palette, 
  Upload, 
  Monitor, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff,
  Sparkles,
  Eye,
  RefreshCw,
  Download
} from 'lucide-react'
import { ThemeConfig, NotificationConfig, CelebrationConfig } from '@/lib/types'
import { ColorScheme, defaultColorSchemes, applyColorScheme, loadColorScheme, resetToStandardTheme } from '@/lib/theme-manager'

interface ThemeCustomizerProps {
  themeConfig: ThemeConfig
  notificationConfig: NotificationConfig
  celebrationConfig: CelebrationConfig
  onThemeChange: (config: ThemeConfig) => void
  onNotificationChange: (config: NotificationConfig) => void
  onCelebrationChange: (config: CelebrationConfig) => void
}

export default function ThemeCustomizer({
  themeConfig,
  notificationConfig,
  celebrationConfig,
  onThemeChange,
  onNotificationChange,
  onCelebrationChange
}: ThemeCustomizerProps) {
  const [currentTheme, setCurrentTheme] = useState(themeConfig)
  const [currentNotifications, setCurrentNotifications] = useState(notificationConfig)
  const [currentCelebrations, setCurrentCelebrations] = useState(celebrationConfig)
  const [customColorScheme, setCustomColorScheme] = useState<ColorScheme>({
    id: 'custom',
    name: 'Custom',
    primary: currentTheme.primaryColor || '#3b82f6',
    secondary: '#e0e7ff',
    background: '#ffffff',
    foreground: '#1e293b',
    accent: '#6366f1',
    muted: '#f8fafc',
    cardBackground: '#ffffff',
    headerBackground: '#ffffff',
    borderColor: '#e2e8f0',
    isDark: false
  })

  // Load saved color scheme on component mount
  useEffect(() => {
    const savedScheme = loadColorScheme()
    if (savedScheme) {
      setCustomColorScheme(savedScheme)
      applyColorScheme(savedScheme)
    }
  }, [])

  const handleThemeUpdate = (updates: Partial<ThemeConfig>) => {
    const newTheme = { ...currentTheme, ...updates }
    setCurrentTheme(newTheme)
    onThemeChange(newTheme)
  }

  const handleNotificationUpdate = (updates: Partial<NotificationConfig>) => {
    const newConfig = { ...currentNotifications, ...updates }
    setCurrentNotifications(newConfig)
    onNotificationChange(newConfig)
  }

  const handleCelebrationUpdate = (updates: Partial<CelebrationConfig>) => {
    const newConfig = { ...currentCelebrations, ...updates }
    setCurrentCelebrations(newConfig)
    onCelebrationChange(newConfig)
  }

  const handleApplyColorScheme = (scheme: ColorScheme) => {
    console.log('Applying preset color scheme:', scheme.name, scheme)
    setCustomColorScheme(scheme)
    applyColorScheme(scheme)
    handleThemeUpdate({ primaryColor: scheme.primary })
    
    // Force a re-render
    setTimeout(() => {
      console.log('Color scheme applied successfully:', scheme.name)
      // Force update the page styles
      document.body.style.backgroundColor = scheme.background
      document.body.style.color = scheme.foreground
    }, 100)
  }

  const handleCustomColorChange = (key: keyof ColorScheme, value: string) => {
    const newScheme = { ...customColorScheme, [key]: value }
    setCustomColorScheme(newScheme)
    // Don't auto-apply, let user click Apply button
    if (key === 'primary') {
      handleThemeUpdate({ primaryColor: value })
    }
  }

  const handleApplyCustomColorScheme = () => {
    console.log('Applying custom color scheme:', customColorScheme)
    applyColorScheme(customColorScheme)
    
    // Force a page refresh to ensure styles take effect
    setTimeout(() => {
      const event = new Event('themeChanged')
      window.dispatchEvent(event)
    }, 100)
  }

  const predefinedBackgrounds = [
    { 
      name: 'None', 
      value: '', 
      preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    },
    { 
      name: 'Ocean Wave', 
      value: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920',
      preview: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=100&h=60&fit=crop'
    },
    { 
      name: 'Forest', 
      value: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920',
      preview: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=100&h=60&fit=crop'
    },
    { 
      name: 'Mountains', 
      value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920',
      preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=60&fit=crop'
    },
    { 
      name: 'Abstract', 
      value: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920',
      preview: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=100&h=60&fit=crop'
    }
  ]

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Customize Apexion
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="colors" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
          </TabsList>

          {/* Color Scheme Settings */}
          <TabsContent value="colors" className="space-y-6">
            {/* Reset to Standard Theme */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Standard Theme</Label>
                  <p className="text-sm text-muted-foreground">Use default light/dark mode without custom colors</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    resetToStandardTheme()
                    // Reset custom color scheme to defaults
                    setCustomColorScheme({
                      id: 'custom',
                      name: 'Custom',
                      primary: '#3b82f6',
                      secondary: '#e0e7ff',
                      background: '#ffffff',
                      foreground: '#1e293b',
                      accent: '#6366f1',
                      muted: '#f8fafc',
                      cardBackground: '#ffffff',
                      headerBackground: '#ffffff',
                      borderColor: '#e2e8f0',
                      isDark: false
                    })
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Theme
                </Button>
              </div>
            </div>

            {/* Preset Color Schemes */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Preset Color Schemes</Label>
              <div className="grid grid-cols-2 gap-3">
                {defaultColorSchemes.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyColorScheme(preset)}
                    className="relative overflow-hidden rounded-lg border-2 p-3 text-left transition-all hover:scale-105 hover:shadow-md"
                    style={{
                      backgroundColor: preset.cardBackground,
                      borderColor: customColorScheme.id === preset.id ? preset.primary : preset.borderColor,
                      color: preset.foreground
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{preset.name}</span>
                      <div className="flex gap-1">
                        {[preset.primary, preset.accent, preset.secondary].map((color, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 rounded-full border"
                            style={{ 
                              backgroundColor: color,
                              borderColor: preset.borderColor
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div 
                      className="text-xs px-2 py-1 rounded text-white"
                      style={{ backgroundColor: preset.primary }}
                    >
                      Sample Button
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Scheme */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Custom Color Scheme</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleApplyCustomColorScheme}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <ColorPicker
                  label="Primary Color"
                  value={customColorScheme.primary}
                  onChange={(value) => handleCustomColorChange('primary', value)}
                />
                
                <ColorPicker
                  label="Background Color"
                  value={customColorScheme.background}
                  onChange={(value) => handleCustomColorChange('background', value)}
                />
                
                <ColorPicker
                  label="Accent Color"
                  value={customColorScheme.accent}
                  onChange={(value) => handleCustomColorChange('accent', value)}
                />
                
                <ColorPicker
                  label="Card Background"
                  value={customColorScheme.cardBackground}
                  onChange={(value) => handleCustomColorChange('cardBackground', value)}
                />
                
                <ColorPicker
                  label="Text Color"
                  value={customColorScheme.foreground}
                  onChange={(value) => handleCustomColorChange('foreground', value)}
                />
                
                <ColorPicker
                  label="Border Color"
                  value={customColorScheme.borderColor}
                  onChange={(value) => handleCustomColorChange('borderColor', value)}
                />
              </div>
              
              <div 
                className="p-4 rounded-lg border"
                style={{
                  background: customColorScheme.cardBackground,
                  color: customColorScheme.foreground,
                  borderColor: customColorScheme.borderColor
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Preview</span>
                  <div className="flex gap-1">
                    {[
                      customColorScheme.primary, 
                      customColorScheme.accent, 
                      customColorScheme.background,
                      customColorScheme.cardBackground,
                      customColorScheme.borderColor
                    ].map((color, i) => (
                      <div 
                        key={i}
                        className="w-3 h-3 rounded border"
                        style={{ 
                          backgroundColor: color,
                          borderColor: customColorScheme.borderColor 
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm opacity-70">Your custom color scheme</p>
                <div 
                  className="mt-2 px-2 py-1 rounded text-xs text-white"
                  style={{ backgroundColor: customColorScheme.primary }}
                >
                  Primary Button Sample
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Theme Settings */}
          <TabsContent value="theme" className="space-y-6">
            {/* Theme Mode */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Appearance Mode</Label>
              <div className="flex gap-2">
                <Button
                  variant={currentTheme.mode === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleThemeUpdate({ mode: 'light' })}
                  className="flex-1"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={currentTheme.mode === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleThemeUpdate({ mode: 'dark' })}
                  className="flex-1"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={currentTheme.mode === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleThemeUpdate({ mode: 'system' })}
                  className="flex-1"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </Button>
              </div>
            </div>

            {/* Background Image */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Background</Label>
              <div className="grid grid-cols-3 gap-2">
                {predefinedBackgrounds.map(bg => (
                  <button
                    key={bg.name}
                    onClick={() => handleThemeUpdate({ backgroundImage: bg.value })}
                    className={`
                      relative w-full h-16 rounded-lg border-2 overflow-hidden transition-all hover:scale-105
                      ${currentTheme.backgroundImage === bg.value 
                        ? 'border-primary shadow-lg' 
                        : 'border-border'
                      }
                    `}
                  >
                    {bg.preview.startsWith('http') ? (
                      <img src={bg.preview} alt={bg.name} className="w-full h-full object-cover" />
                    ) : (
                      <div 
                        className="w-full h-full"
                        style={{ background: bg.preview }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">{bg.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={currentTheme.backgroundImage || ''}
                  onChange={(e) => handleThemeUpdate({ backgroundImage: e.target.value })}
                  placeholder="Custom image URL..."
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts and updates</p>
              </div>
              <Switch
                checked={currentNotifications.enabled}
                onCheckedChange={(enabled) => handleNotificationUpdate({ enabled })}
              />
            </div>

            {currentNotifications.enabled && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Browser Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show desktop notifications</p>
                  </div>
                  <Switch
                    checked={currentNotifications.browser}
                    onCheckedChange={(browser) => handleNotificationUpdate({ browser })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound Alerts</Label>
                    <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                  </div>
                  <Switch
                    checked={currentNotifications.sound}
                    onCheckedChange={(sound) => handleNotificationUpdate({ sound })}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Notification Types</Label>
                  {Object.entries(currentNotifications.types).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(value) => 
                          handleNotificationUpdate({
                            types: { ...currentNotifications.types, [key]: value }
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Effects & Celebrations */}
          <TabsContent value="effects" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Celebrations</Label>
                <p className="text-sm text-muted-foreground">Celebrate your achievements</p>
              </div>
              <Switch
                checked={currentCelebrations.enabled}
                onCheckedChange={(enabled) => handleCelebrationUpdate({ enabled })}
              />
            </div>

            {currentCelebrations.enabled && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">Play sounds on completion</p>
                  </div>
                  <Switch
                    checked={currentCelebrations.soundEnabled}
                    onCheckedChange={(soundEnabled) => handleCelebrationUpdate({ soundEnabled })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Animations</Label>
                    <p className="text-sm text-muted-foreground">Visual celebrations and confetti</p>
                  </div>
                  <Switch
                    checked={currentCelebrations.animationEnabled}
                    onCheckedChange={(animationEnabled) => handleCelebrationUpdate({ animationEnabled })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Achievement Badges</Label>
                    <p className="text-sm text-muted-foreground">Unlock and display achievements</p>
                  </div>
                  <Switch
                    checked={currentCelebrations.achievements}
                    onCheckedChange={(achievements) => handleCelebrationUpdate({ achievements })}
                  />
                </div>
              </>
            )}

            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Trigger test celebration
                  if (typeof window !== 'undefined') {
                    const event = new CustomEvent('test-celebration', {
                      detail: { message: 'Test celebration!' }
                    })
                    window.dispatchEvent(event)
                  }
                }}
                className="w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Test Celebration Effect
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
