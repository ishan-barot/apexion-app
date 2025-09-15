

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  showPresets?: boolean
}

export function ColorPicker({ value, onChange, label, showPresets = true }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const presetColors = [
    '#3b82f6', // Blue
    '#8b5cf6', // Purple  
    '#ec4899', // Pink
    '#10b981', // Green
    '#f59e0b', // Orange
    '#ef4444', // Red
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#84cc16', // Lime
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#8b5cf6', // Violet
  ]

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
          >
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: value }}
            />
            {value.toUpperCase()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-16 h-10 p-1 border-2"
              />
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
            
            {showPresets && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Preset Colors</Label>
                <div className="grid grid-cols-6 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        onChange(color)
                        setIsOpen(false)
                      }}
                      className={`
                        w-8 h-8 rounded border-2 transition-all hover:scale-110 relative overflow-hidden
                        ${value === color ? 'border-gray-900 scale-110' : 'border-gray-300'}
                      `}
                      style={{ 
                        backgroundColor: color + ' !important',
                        backgroundImage: 'none !important'
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
