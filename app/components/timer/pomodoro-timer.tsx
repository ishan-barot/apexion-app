
'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Square, Settings, Maximize2, Volume2, VolumeX, Calculator } from 'lucide-react'
import { TaskWithCategory, Subject, TimerState, PomodoroSettings } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import TimerSettings from './timer-settings'
import CommissionCalculator from '@/components/settings/commission-calculator'

interface PomodoroTimerProps {
  task?: TaskWithCategory | null
  subject?: Subject | null
  onSessionComplete?: (duration: number, sessionType: string) => void
}

const defaultSettings: PomodoroSettings = {
  workDuration: 25, // 25 minutes
  shortBreakDuration: 5, // 5 minutes  
  longBreakDuration: 15, // 15 minutes
  longBreakInterval: 4 // long break every 4 sessions
}

export default function PomodoroTimer({ task, subject, onSessionComplete }: PomodoroTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    timeRemaining: defaultSettings.workDuration * 60, // convert to seconds
    sessionType: 'work',
    currentTaskId: task?.id,
    currentSubjectId: subject?.id
  })
  
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings)
  const [sessionCount, setSessionCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showCommissionCalculator, setShowCommissionCalculator] = useState(false)
  const [totalTimeWorked, setTotalTimeWorked] = useState(0) // Track total time for commission
  const [elapsedTime, setElapsedTime] = useState(0) // Track elapsed time since session start (seconds)
  const [lastSavedTime, setLastSavedTime] = useState(0) // Track last saved time to avoid duplicate saves
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // timer logic
  useEffect(() => {
    if (timerState.isActive && !timerState.isPaused) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          if (prev.timeRemaining <= 1) {
            // timer completed
            handleTimerComplete()
            return {
              ...prev,
              timeRemaining: 0,
              isActive: false,
              isPaused: false
            }
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1
          }
        })
        
        // Track elapsed time for work sessions
        if (timerState.sessionType === 'work') {
          setElapsedTime(prev => prev + 1)
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState.isActive, timerState.isPaused, timerState.sessionType])

  // Periodically save partial time (every minute)
  useEffect(() => {
    if (timerState.isActive && !timerState.isPaused && timerState.sessionType === 'work' && task?.id) {
      const saveInterval = setInterval(() => {
        savePartialTime()
      }, 60000) // Save every minute

      return () => clearInterval(saveInterval)
    }
  }, [timerState.isActive, timerState.isPaused, timerState.sessionType, task?.id, elapsedTime])

  const handleTimerComplete = async () => {
    const duration = getDurationForSession(timerState.sessionType)
    
    // play notification sound if enabled
    if (soundEnabled) {
      playNotificationSound()
    }

    // show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${timerState.sessionType} session complete!`, {
        body: getSessionCompleteMessage(timerState.sessionType),
        icon: '/favicon.ico'
      })
    }

    // save session to database (this will automatically update task timeSpent)
    if (task || subject) {
      await saveTimerSession(duration, timerState.sessionType)
    }

    // Track total time worked for commission calculator
    if (timerState.sessionType === 'work') {
      setTotalTimeWorked(prev => prev + duration)
    }

    // call completion callback
    if (onSessionComplete) {
      onSessionComplete(duration, timerState.sessionType)
    }

    // show completion toast
    toast({
      title: 'session complete!',
      description: getSessionCompleteMessage(timerState.sessionType)
    })

    // Reset elapsed time tracking after completion
    setElapsedTime(0)
    setLastSavedTime(0)

    // auto-start next session (break or work)
    if (timerState.sessionType === 'work') {
      setSessionCount(prev => prev + 1)
      const isLongBreak = (sessionCount + 1) % settings.longBreakInterval === 0
      const nextSession = isLongBreak ? 'long_break' : 'short_break'
      startBreakSession(nextSession)
    }
  }

  const getDurationForSession = (sessionType: string): number => {
    switch (sessionType) {
      case 'work': return settings.workDuration
      case 'short_break': return settings.shortBreakDuration  
      case 'long_break': return settings.longBreakDuration
      default: return settings.workDuration
    }
  }

  const getSessionCompleteMessage = (sessionType: string): string => {
    switch (sessionType) {
      case 'work': return 'great job! time for a break'
      case 'short_break': return 'break over. ready to get back to work?'
      case 'long_break': return 'long break finished. feeling refreshed?'
      default: return 'session complete!'
    }
  }

  const playNotificationSound = () => {
    // simple audio notification - could use a proper sound file
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 1)
  }

  const saveTimerSession = async (duration: number, sessionType: string) => {
    try {
      await fetch('/api/timer-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task?.id,
          duration,
          sessionType,
          subjectId: subject?.id
        })
      })
    } catch (error) {
      console.error('failed to save timer session:', error)
    }
  }

  const savePartialTime = async () => {
    if (!task?.id || timerState.sessionType !== 'work') return
    
    const minutesElapsed = Math.floor(elapsedTime / 60)
    const unsavedMinutes = minutesElapsed - lastSavedTime
    
    if (unsavedMinutes > 0) {
      try {
        await fetch('/api/timer-sessions/partial', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: task.id,
            minutesElapsed: unsavedMinutes
          })
        })
        setLastSavedTime(minutesElapsed)
        
        // Update the parent component to refresh the task display
        if (onSessionComplete) {
          onSessionComplete(unsavedMinutes, 'partial_update')
        }
      } catch (error) {
        console.error('failed to save partial time:', error)
      }
    }
  }

  const startWorkSession = () => {
    // Reset elapsed time when starting a new session
    setElapsedTime(0)
    setLastSavedTime(0)
    setTimerState({
      ...timerState,
      isActive: true,
      isPaused: false,
      timeRemaining: settings.workDuration * 60,
      sessionType: 'work'
    })
  }

  const startBreakSession = (type: 'short_break' | 'long_break') => {
    const duration = type === 'short_break' ? settings.shortBreakDuration : settings.longBreakDuration
    // Save any partial time before starting break
    if (timerState.sessionType === 'work') {
      savePartialTime()
    }
    setElapsedTime(0)
    setLastSavedTime(0)
    setTimerState({
      ...timerState,
      isActive: true,
      isPaused: false,
      timeRemaining: duration * 60,
      sessionType: type
    })
  }

  const pauseTimer = async () => {
    // Save partial time when pausing a work session
    if (timerState.sessionType === 'work' && timerState.isActive && !timerState.isPaused) {
      await savePartialTime()
    }
    setTimerState(prev => ({ ...prev, isPaused: !prev.isPaused }))
  }

  const stopTimer = async () => {
    // Save partial time when stopping a work session
    if (timerState.sessionType === 'work' && timerState.isActive) {
      await savePartialTime()
    }
    setTimerState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      timeRemaining: getDurationForSession(prev.sessionType) * 60
    }))
    setElapsedTime(0)
    setLastSavedTime(0)
  }

  const resetTimer = async () => {
    // Save partial time before resetting
    if (timerState.sessionType === 'work' && timerState.isActive) {
      await savePartialTime()
    }
    setTimerState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      timeRemaining: getDurationForSession(prev.sessionType) * 60
    }))
    setSessionCount(0)
    setElapsedTime(0)
    setLastSavedTime(0)
  }

  const handleSettingsChange = (newSettings: PomodoroSettings) => {
    setSettings(newSettings)
    // Update timer if not active
    if (!timerState.isActive) {
      setTimerState(prev => ({
        ...prev,
        timeRemaining: getDurationForSession(prev.sessionType) * 60
      }))
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getSessionBadgeColor = (sessionType: string) => {
    switch (sessionType) {
      case 'work': return 'bg-blue-100 text-blue-800'
      case 'short_break': return 'bg-green-100 text-green-800'
      case 'long_break': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSessionTitle = (sessionType: string) => {
    switch (sessionType) {
      case 'work': return 'work session'
      case 'short_break': return 'short break'
      case 'long_break': return 'long break'
      default: return 'session'
    }
  }

  return (
    <>
      <Card className={isFullscreen ? 'fixed inset-0 z-50 rounded-none dark:bg-gray-900' : 'dark:bg-gray-800'}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">pomodoro timer</CardTitle>
            {task && (
              <p className="text-sm text-gray-600 mt-1">{task.title}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommissionCalculator(true)}
              title="Commission Calculator"
            >
              <Calculator className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              title="Timer Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Disable Sound" : "Enable Sound"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <Badge className={getSessionBadgeColor(timerState.sessionType)}>
              {getSessionTitle(timerState.sessionType)}
            </Badge>
            
            <div className={`font-mono font-bold ${isFullscreen ? 'text-8xl' : 'text-6xl'}`}>
              {formatTime(timerState.timeRemaining)}
            </div>
            
            {subject && (
              <div className="flex items-center justify-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: subject.color }}
                />
                <span className="text-sm text-gray-600">{subject.name}</span>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3">
            {!timerState.isActive ? (
              <Button onClick={startWorkSession} className="px-6">
                <Play className="mr-2 h-4 w-4" />
                start
              </Button>
            ) : (
              <Button onClick={pauseTimer} variant="outline" className="px-6">
                {timerState.isPaused ? (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    resume
                  </>
                ) : (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    pause
                  </>
                )}
              </Button>
            )}
            
            <Button onClick={stopTimer} variant="outline" className="px-6">
              <Square className="mr-2 h-4 w-4" />
              stop
            </Button>
            
            <Button onClick={resetTimer} variant="outline" className="px-6">
              reset
            </Button>
          </div>

          {/* break session controls */}
          {!timerState.isActive && (
            <div className="flex justify-center gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => startBreakSession('short_break')}
              >
                {settings.shortBreakDuration} min break
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => startBreakSession('long_break')}
              >
                {settings.longBreakDuration} min long break
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            session #{sessionCount + 1}
          </div>
        </CardContent>
      </Card>

      {/* timer settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <TimerSettings
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onClose={() => setShowSettings(false)}
          />
        </div>
      )}

      {/* commission calculator modal */}
      {showCommissionCalculator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Commission Calculator</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommissionCalculator(false)}
              >
                ×
              </Button>
            </div>
            <div className="p-4">
              <CommissionCalculator
                timeWorked={totalTimeWorked}
                onSettingsChange={(settings) => {
                  // Save commission settings to user preferences
                  console.log('Commission settings updated:', settings)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
