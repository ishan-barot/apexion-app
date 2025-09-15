

'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Clock, Check, X } from 'lucide-react'
import { EditableTimeProps } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function EditableTime({ value, onUpdate, readOnly = false }: EditableTimeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState('')

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const parseTimeInput = (input: string): number => {
    // Handle formats like "2h 30m", "2h", "30m", "150"
    const hourMatch = input.match(/(\d+)h/)
    const minMatch = input.match(/(\d+)m/)
    const numberOnlyMatch = input.match(/^(\d+)$/)

    let totalMinutes = 0

    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1]) * 60
    }
    if (minMatch) {
      totalMinutes += parseInt(minMatch[1])
    }
    if (numberOnlyMatch && !hourMatch && !minMatch) {
      // If just a number, treat as minutes
      totalMinutes = parseInt(numberOnlyMatch[1])
    }

    return Math.max(0, totalMinutes)
  }

  const handleEdit = () => {
    if (readOnly) return
    setTempValue(formatTime(value))
    setIsEditing(true)
  }

  const handleSave = async () => {
    const newValue = parseTimeInput(tempValue)
    if (newValue !== value) {
      await onUpdate(newValue)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempValue('')
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 2h 30m or 150"
          className="w-24 h-6 text-xs"
          autoFocus
        />
        <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0">
          <Check className="h-3 w-3 text-green-600" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 w-6 p-0">
          <X className="h-3 w-3 text-red-600" />
        </Button>
      </div>
    )
  }

  return (
    <button
      onClick={handleEdit}
      disabled={readOnly}
      className={cn(
        "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors",
        readOnly ? "cursor-default" : "cursor-pointer hover:bg-muted rounded px-1 py-0.5"
      )}
    >
      <Clock className="h-3 w-3" />
      <span className="font-mono">
        Time spent: {formatTime(value)}
      </span>
    </button>
  )
}
