

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Save, RotateCcw } from 'lucide-react'
import { PomodoroSettings } from '@/lib/types'

interface TimerSettingsProps {
  settings: PomodoroSettings
  onSettingsChange: (settings: PomodoroSettings) => void
  onClose: () => void
}

export default function TimerSettings({ settings, onSettingsChange, onClose }: TimerSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    onSettingsChange(localSettings)
    onClose()
  }

  const handleReset = () => {
    const defaultSettings: PomodoroSettings = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4
    }
    setLocalSettings(defaultSettings)
  }

  const handleChange = (field: keyof PomodoroSettings, value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: Math.max(1, Math.min(120, value)) // clamp between 1 and 120 minutes
    }))
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Timer Settings
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workDuration">Work Session Duration</Label>
            <div className="flex items-center gap-2">
              <Input
                id="workDuration"
                type="number"
                min="1"
                max="120"
                value={localSettings.workDuration}
                onChange={(e) => handleChange('workDuration', parseInt(e.target.value) || 25)}
                className="w-20"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">minutes</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortBreakDuration">Short Break Duration</Label>
            <div className="flex items-center gap-2">
              <Input
                id="shortBreakDuration"
                type="number"
                min="1"
                max="60"
                value={localSettings.shortBreakDuration}
                onChange={(e) => handleChange('shortBreakDuration', parseInt(e.target.value) || 5)}
                className="w-20"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">minutes</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="longBreakDuration">Long Break Duration</Label>
            <div className="flex items-center gap-2">
              <Input
                id="longBreakDuration"
                type="number"
                min="1"
                max="60"
                value={localSettings.longBreakDuration}
                onChange={(e) => handleChange('longBreakDuration', parseInt(e.target.value) || 15)}
                className="w-20"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">minutes</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="longBreakInterval">Long Break Interval</Label>
            <div className="flex items-center gap-2">
              <Input
                id="longBreakInterval"
                type="number"
                min="2"
                max="10"
                value={localSettings.longBreakInterval}
                onChange={(e) => handleChange('longBreakInterval', parseInt(e.target.value) || 4)}
                className="w-20"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">work sessions</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Long break after every {localSettings.longBreakInterval} work sessions
            </p>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
