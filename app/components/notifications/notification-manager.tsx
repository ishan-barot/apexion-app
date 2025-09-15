
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, BellOff, Settings } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [supported, setSupported] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // check if notifications are supported
    if ('Notification' in window) {
      setSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!supported) {
      toast({
        title: 'not supported',
        description: 'notifications are not supported in this browser',
        variant: 'destructive'
      })
      return
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        toast({
          description: 'notifications enabled! you\'ll get reminders for due tasks'
        })
        
        // show a test notification
        new Notification('Smart Task Manager', {
          body: 'notifications are now enabled for task reminders',
          icon: '/favicon.ico'
        })
        
        // schedule task reminders
        scheduleTaskReminders()
      } else {
        toast({
          title: 'permission denied',
          description: 'you can enable notifications in your browser settings',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('notification permission error:', error)
      toast({
        title: 'error',
        description: 'failed to enable notifications',
        variant: 'destructive'
      })
    }
  }

  const scheduleTaskReminders = async () => {
    try {
      // fetch upcoming tasks
      const response = await fetch('/api/tasks?status=todo')
      if (!response.ok) return

      const tasks = await response.json()
      
      // schedule notifications for tasks due within 24 hours
      tasks.forEach((task: any) => {
        if (task.dueDate) {
          const dueTime = new Date(task.dueDate).getTime()
          const now = new Date().getTime()
          const timeDiff = dueTime - now
          
          // notify 1 hour before due date
          const reminderTime = timeDiff - (60 * 60 * 1000)
          
          if (reminderTime > 0 && reminderTime < 24 * 60 * 60 * 1000) {
            setTimeout(() => {
              if (Notification.permission === 'granted') {
                new Notification(`Task Due Soon: ${task.title}`, {
                  body: `This task is due in 1 hour`,
                  icon: '/favicon.ico',
                  tag: `task-${task.id}`,
                  requireInteraction: true
                })
              }
            }, reminderTime)
          }
        }
      })
    } catch (error) {
      console.error('failed to schedule reminders:', error)
    }
  }

  const getStatusBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge className="gap-1"><Bell className="h-3 w-3" />enabled</Badge>
      case 'denied':
        return <Badge variant="destructive" className="gap-1"><BellOff className="h-3 w-3" />blocked</Badge>
      default:
        return <Badge variant="secondary" className="gap-1"><BellOff className="h-3 w-3" />disabled</Badge>
    }
  }

  if (!supported) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Bell className="h-4 w-4" />
        </Button>
      </div>

      {/* notification settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                get browser notifications for task reminders
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Browser Notifications</p>
                  <p className="text-sm text-gray-600">
                    current status: {permission}
                  </p>
                </div>
                {getStatusBadge()}
              </div>

              {permission !== 'granted' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    enable notifications to get reminders about:
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• tasks due within 1 hour</li>
                    <li>• daily productivity summaries</li>
                    <li>• streak reminders</li>
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {permission !== 'granted' && (
                  <Button onClick={requestPermission} className="flex-1">
                    enable notifications
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setShowSettings(false)}
                  className={permission === 'granted' ? 'flex-1' : ''}
                >
                  {permission === 'granted' ? 'close' : 'maybe later'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
