

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckCircle } from 'lucide-react'
import { format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay,
  addMonths,
  subMonths 
} from 'date-fns'
import { CalendarEvent, TaskWithCategory } from '@/lib/types'

interface CalendarViewProps {
  tasks: TaskWithCategory[]
  onTaskClick?: (task: TaskWithCategory) => void
}

export default function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Convert tasks to calendar events
  const getCalendarEvents = (): CalendarEvent[] => {
    if (!tasks || !Array.isArray(tasks)) {
      console.warn('Tasks is not an array:', tasks)
      return []
    }
    
    const events: CalendarEvent[] = []

    tasks.forEach(task => {
      try {
        if (task.dueDate) {
          events.push({
            id: `due-${task.id}`,
            title: task.title || 'Untitled Task',
            date: new Date(task.dueDate),
            taskId: task.id,
            color: task.category?.color || '#3B82F6',
            type: 'due'
          })
        }

        if (task.completedAt) {
          events.push({
            id: `completed-${task.id}`,
            title: task.title || 'Untitled Task',
            date: new Date(task.completedAt),
            taskId: task.id,
            color: task.category?.color || '#3B82F6',
            type: 'completed'
          })
        }
      } catch (error) {
        console.error('Error processing task for calendar:', task, error)
      }
    })

    return events
  }

  const events = getCalendarEvents()
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date))
  }

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
    setSelectedDate(null)
  }

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
    setSelectedDate(null)
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar View
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[120px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-sm font-medium text-center text-muted-foreground">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {monthDays.map(day => {
              const dayEvents = getEventsForDate(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isCurrentMonth = isSameMonth(day, currentDate)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(isSelected ? null : day)}
                  className={`
                    min-h-[80px] p-1 border rounded-md text-left transition-colors hover:bg-muted/50
                    ${isSelected ? 'bg-primary/10 border-primary' : 'border-border'}
                    ${isToday(day) ? 'bg-accent' : ''}
                    ${!isCurrentMonth ? 'text-muted-foreground opacity-50' : ''}
                  `}
                >
                  <div className="text-sm font-medium mb-1">
                    {format(day, 'd')}
                  </div>
                  
                  {/* Event indicators */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className="px-1 py-0.5 rounded text-xs truncate text-white"
                        style={{ backgroundColor: event.color }}
                        title={event.title}
                      >
                        {event.type === 'due' ? '📅' : '✅'} {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && selectedDateEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedDateEvents.map(event => {
                const task = tasks.find(t => t.id === event.taskId)
                if (!task) return null

                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                    onClick={() => onTaskClick?.(task)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                      <div>
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground">{task.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.type === 'due' ? (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Due
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
