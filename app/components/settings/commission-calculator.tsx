

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calculator, DollarSign, Target, Clock, TrendingUp } from 'lucide-react'
import { CommissionSettings } from '@/lib/types'

interface CommissionCalculatorProps {
  timeWorked: number // minutes
  settings?: CommissionSettings
  onSettingsChange?: (settings: CommissionSettings) => void
}

export default function CommissionCalculator({ 
  timeWorked, 
  settings, 
  onSettingsChange 
}: CommissionCalculatorProps) {
  const [localSettings, setLocalSettings] = useState<CommissionSettings>(
    settings || {
      rate: 25,
      type: 'flat',
      target: 8 * 60 // 8 hours in minutes
    }
  )

  const [tempRate, setTempRate] = useState(localSettings.rate.toString())
  const [tempTarget, setTempTarget] = useState((localSettings.target / 60).toString()) // convert to hours for display

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
      setTempRate(settings.rate.toString())
      setTempTarget((settings.target / 60).toString())
    }
  }, [settings])

  const calculateCommission = (): number => {
    const hoursWorked = timeWorked / 60

    if (localSettings.type === 'percentage') {
      // Assuming base rate for percentage calculation
      const baseHourlyRate = 25 // Default base rate
      return (hoursWorked * baseHourlyRate * localSettings.rate) / 100
    } else {
      // Flat rate per hour
      return hoursWorked * localSettings.rate
    }
  }

  const getProgressToTarget = (): number => {
    return Math.min((timeWorked / localSettings.target) * 100, 100)
  }

  const saveSettings = () => {
    const newSettings: CommissionSettings = {
      ...localSettings,
      rate: parseFloat(tempRate) || 0,
      target: (parseFloat(tempTarget) || 8) * 60 // convert hours to minutes
    }
    setLocalSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  const commission = calculateCommission()
  const progress = getProgressToTarget()
  const hoursWorked = timeWorked / 60
  const targetHours = localSettings.target / 60
  const remainingHours = Math.max(targetHours - hoursWorked, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Commission Calculator
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Commission Type</Label>
            <Select
              value={localSettings.type}
              onValueChange={(value: 'percentage' | 'flat') => 
                setLocalSettings(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat Rate ($/hour)</SelectItem>
                <SelectItem value="percentage">Percentage of Base</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              {localSettings.type === 'percentage' ? 'Percentage (%)' : 'Rate ($/hour)'}
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={tempRate}
                onChange={(e) => setTempRate(e.target.value)}
                placeholder="25"
                className="flex-1"
              />
              <Button size="sm" onClick={saveSettings}>
                Save
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Daily Target (hours)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={tempTarget}
              onChange={(e) => setTempTarget(e.target.value)}
              placeholder="8"
              step="0.5"
              className="flex-1"
            />
            <Button size="sm" onClick={saveSettings}>
              Save
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Time Worked</span>
              </div>
              <div className="text-2xl font-bold">
                {Math.floor(hoursWorked)}h {Math.round((hoursWorked % 1) * 60)}m
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Commission</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                ${commission.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Progress to Target */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Progress to Target</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {progress.toFixed(1)}%
              </span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0h</span>
              <span>{targetHours}h target</span>
            </div>
          </div>

          {remainingHours > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {remainingHours.toFixed(1)} hours remaining to reach target
                </span>
              </div>
              <div className="text-xs text-blue-600/80 mt-1">
                Potential additional: ${((remainingHours * localSettings.rate)).toFixed(2)}
              </div>
            </div>
          )}

          {progress >= 100 && (
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-600">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">
                  🎉 Target achieved! Great work!
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
