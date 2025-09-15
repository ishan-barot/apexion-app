
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Timer,
  Play,
  ChevronDown,
  ChevronUp,
  Filter,
  Zap,
  BookOpen,
  Settings,
  Grid3X3,
  AlignJustify,
  Square,
  Palette
} from 'lucide-react'
import { TaskWithCategory, Category } from '@/lib/types'
import { formatDistanceToNow, isAfter, format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'
import EditableTime from '@/components/ui/editable-time'

interface TaskListProps {
  tasks: TaskWithCategory[]
  categories: Category[]
  onEdit: (task: TaskWithCategory) => void
  onDelete: (taskId: string) => void
  onUpdate: (task: TaskWithCategory) => void
  onStartTimer?: (task: TaskWithCategory) => void
}

export default function TaskList({ tasks, categories, onEdit, onDelete, onUpdate, onStartTimer }: TaskListProps) {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
  
  // Filter states
  const [filters, setFilters] = useState({
    urgency: 'all', // 'all', '1', '2', '3', '4'
    subject: 'all', // 'all', subject.id, 'none' 
    date: 'all', // 'all', 'today', 'tomorrow', 'overdue', 'this-week', 'this-month'
    viewMode: 'list', // 'list', 'grid', 'compact'
    colorCoded: true // Enable category color coding for task boxes
  })

  const toggleSessionDetails = (taskId: string) => {
    const newExpanded = new Set(expandedSessions)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedSessions(newExpanded)
  }

  // Get unique subjects from tasks
  const uniqueSubjects = tasks.reduce((acc, task) => {
    if (task.subject && !acc.find(s => s.id === task.subject!.id)) {
      acc.push(task.subject)
    }
    return acc
  }, [] as any[])

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    // Filter by urgency
    if (filters.urgency !== 'all' && task.priority.toString() !== filters.urgency) {
      return false
    }

    // Filter by subject
    if (filters.subject !== 'all') {
      if (filters.subject === 'none' && task.subject) {
        return false
      }
      if (filters.subject !== 'none' && (!task.subject || task.subject.id !== filters.subject)) {
        return false
      }
    }

    // Filter by date
    if (filters.date !== 'all' && task.dueDate) {
      const dueDate = new Date(task.dueDate)
      const now = new Date()
      
      switch (filters.date) {
        case 'today':
          if (!isToday(dueDate)) return false
          break
        case 'tomorrow':
          if (!isTomorrow(dueDate)) return false
          break
        case 'overdue':
          if (!isAfter(now, dueDate) || task.status === 'completed') return false
          break
        case 'this-week':
          const weekFromNow = new Date()
          weekFromNow.setDate(weekFromNow.getDate() + 7)
          if (isAfter(dueDate, weekFromNow)) return false
          break
        case 'this-month':
          const monthFromNow = new Date()
          monthFromNow.setMonth(monthFromNow.getMonth() + 1)
          if (isAfter(dueDate, monthFromNow)) return false
          break
      }
    } else if (filters.date !== 'all' && !task.dueDate) {
      return false
    }

    return true
  })

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No Tasks Found</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Create your first task to get started</p>
      </div>
    )
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="space-y-4">
        {/* Filter controls will go here */}
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No Tasks Match Your Filters</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try adjusting your filter settings</p>
        </div>
      </div>
    )
  }

  const handleStatusChange = async (task: TaskWithCategory, newStatus: string) => {
    setUpdatingTaskId(task.id)
    
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const updatedTask = await response.json()
        onUpdate(updatedTask)
      }
    } catch (error) {
      console.error('failed to update task status:', error)
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onDelete(taskId)
      }
    } catch (error) {
      console.error('failed to delete task:', error)
    }
  }

  const handleTimeUpdate = async (taskId: string, newTimeSpent: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSpent: newTimeSpent })
      })

      if (response.ok) {
        const updatedTask = await response.json()
        onUpdate(updatedTask)
      }
    } catch (error) {
      console.error('failed to update task time:', error)
    }
  }

  const getPriorityBadge = (priority: number) => {
    const variants = {
      1: { variant: 'secondary' as const, text: 'Low', color: 'text-gray-600', icon: '○' },
      2: { variant: 'default' as const, text: 'Medium', color: 'text-blue-600', icon: '◐' },
      3: { variant: 'destructive' as const, text: 'High', color: 'text-orange-600', icon: '●' },
      4: { variant: 'destructive' as const, text: 'Urgent', color: 'text-red-600', icon: '⚡' }
    }
    return variants[priority as keyof typeof variants] || variants[1]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Filter Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={filters.viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, viewMode: 'list' }))}
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
            <Button
              variant={filters.viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, viewMode: 'grid' }))}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={filters.viewMode === 'compact' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, viewMode: 'compact' }))}
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Urgency Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Urgency Level</label>
            <Select
              value={filters.urgency}
              onValueChange={(value) => setFilters(prev => ({ ...prev, urgency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgencies</SelectItem>
                <SelectItem value="1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">○</span>
                    Low
                  </div>
                </SelectItem>
                <SelectItem value="2">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">◐</span>
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="3">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600">●</span>
                    High
                  </div>
                </SelectItem>
                <SelectItem value="4">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600">⚡</span>
                    Urgent
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Study Subject</label>
            <Select
              value={filters.subject}
              onValueChange={(value) => setFilters(prev => ({ ...prev, subject: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="none">No Subject</SelectItem>
                {uniqueSubjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: subject.color }}
                      />
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Select
              value={filters.date}
              onValueChange={(value) => setFilters(prev => ({ ...prev, date: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Due Today</SelectItem>
                <SelectItem value="tomorrow">Due Tomorrow</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Coding Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium">View Options</label>
            <div className="space-y-2">
              <Button
                variant={filters.colorCoded ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, colorCoded: !prev.colorCoded }))}
                className="w-full"
              >
                <Palette className="mr-2 h-4 w-4" />
                Color Coded
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setFilters({
                  urgency: 'all',
                  subject: 'all',
                  date: 'all',
                  viewMode: filters.viewMode,
                  colorCoded: filters.colorCoded
                })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
        </div>
      </div>

      {/* Tasks List */}
      <div className={filters.viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {filteredTasks.map(task => {
          const isOverdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate)) && task.status !== 'completed'
          const dueSoon = task.dueDate && 
            !isOverdue && 
            isAfter(new Date(task.dueDate), new Date()) && 
            new Date(task.dueDate).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000

          const taskSizeClass = filters.viewMode === 'compact' ? 'p-3' : 'p-4'
          const taskLayoutClass = filters.viewMode === 'compact' ? 'gap-2' : 'gap-3'

          return (
            <div 
              key={task.id}
              className={`border rounded-lg ${taskSizeClass} hover:shadow-md transition-all duration-200 ${
                task.status === 'completed' 
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 opacity-80' 
                  : isOverdue 
                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20' 
                    : dueSoon 
                      ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20' 
                      : filters.colorCoded 
                        ? 'border-gray-200' 
                        : 'border-gray-200 bg-card dark:border-gray-700'
              }`}
              style={filters.colorCoded && task.status !== 'completed' ? {
                backgroundColor: `${task.category.color}08`,
                borderLeftColor: task.category.color,
                borderLeftWidth: '4px'
              } : task.status === 'completed' ? {
                borderLeftColor: '#10b981',
                borderLeftWidth: '4px'
              } : {}}
            >
              <div className="flex items-start gap-3">
                {/* status icon */}
                <button
                  onClick={() => {
                    const newStatus = task.status === 'completed' ? 'todo' : 
                      task.status === 'todo' ? 'in_progress' : 'completed'
                    handleStatusChange(task, newStatus)
                  }}
                  disabled={updatingTaskId === task.id}
                  className="mt-1 hover:scale-110 transition-transform"
                >
                  {getStatusIcon(task.status)}
                </button>

                {/* task content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${
                        task.status === 'completed' 
                          ? 'line-through text-gray-500 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`text-sm mt-1 ${
                          task.status === 'completed' 
                            ? 'text-gray-400 dark:text-gray-500 line-through' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {task.description}
                        </p>
                      )}
                      
                      {/* metadata */}
                      <div className={`${filters.viewMode === 'compact' ? 'mt-2' : 'mt-3'} space-y-2`}>
                        {/* Category and Due Date */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge 
                            style={{ backgroundColor: task.category.color }}
                            className="text-white text-xs"
                          >
                            {task.category.name}
                          </Badge>

                          {task.dueDate && (
                            <div className={`flex items-center gap-1 text-xs ${
                              isOverdue ? 'text-red-600 dark:text-red-400' : 
                              dueSoon ? 'text-yellow-600 dark:text-yellow-400' : 
                              'text-gray-500 dark:text-gray-400'
                            }`}>
                              <Calendar className="h-3 w-3" />
                              {isOverdue ? 'Overdue ' : ''}
                              {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                            </div>
                          )}
                        </div>

                        {/* Study Subject */}
                        {task.subject && (
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Subject:</span>
                              <Badge 
                                style={{ backgroundColor: task.subject.color }}
                                variant="outline"
                                className="text-xs border-2"
                              >
                                {task.subject.name}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side - Timer and actions */}
                    <div className="flex flex-col items-end gap-2">
                      {/* Timer button and actions row */}
                      <div className="flex items-center gap-2">
                        {/* timer button for all tasks */}
                        {onStartTimer && task.status !== 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onStartTimer(task)}
                            className="gap-1"
                          >
                            <Timer className="h-3 w-3" />
                            Timer
                          </Button>
                        )}

                        {/* study session display */}
                        {task.timerSessions && task.timerSessions.length > 0 && (
                          <button
                            onClick={() => toggleSessionDetails(task.id)}
                            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors"
                          >
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor(task.timerSessions.reduce((total, session) => total + session.duration, 0) / 60)}h 
                              {task.timerSessions.reduce((total, session) => total + session.duration, 0) % 60}m
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              {task.timerSessions.length} Session{task.timerSessions.length !== 1 ? 's' : ''}
                            </div>
                            {expandedSessions.has(task.id) ? 
                              <ChevronUp className="h-3 w-3" /> : 
                              <ChevronDown className="h-3 w-3" />
                            }
                          </button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(task)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(task.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Urgency and Time Spent - Under timer */}
                      <div className="flex flex-col items-end gap-1 text-xs">
                        {/* Urgency Level */}
                        <div className="flex items-center gap-2">
                          <Badge {...getPriorityBadge(task.priority)} className="text-xs">
                            <span className="mr-1">{getPriorityBadge(task.priority).icon}</span>
                            {getPriorityBadge(task.priority).text}
                          </Badge>
                        </div>

                        {/* AI Priority suggestion */}
                        {task.aiPriority && task.aiPriority !== task.priority && (
                          <Badge variant="outline" className="text-xs">
                            AI: {getPriorityBadge(task.aiPriority).text}
                          </Badge>
                        )}

                        {/* Time Spent - Editable */}
                        <div className="flex justify-end">
                          <EditableTime
                            value={task.timeSpent || 0}
                            onUpdate={(newTime) => handleTimeUpdate(task.id, newTime)}
                            readOnly={task.status === 'completed'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            {/* expanded study session details */}
            {expandedSessions.has(task.id) && task.timerSessions && task.timerSessions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Study Sessions</h4>
                <div className="space-y-2">
                  {task.timerSessions
                    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                    .map((session, index) => (
                      <div 
                        key={session.id || index}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(session.startTime).toLocaleDateString()} at{' '}
                            {new Date(session.startTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          {session.sessionType && (
                            <Badge variant="outline" className="text-xs">
                              {session.sessionType}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {Math.floor(session.duration / 60)}h {session.duration % 60}m
                        </div>
                      </div>
                    ))}
                </div>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                  Total Study Time: {Math.floor(task.timerSessions.reduce((total, session) => total + session.duration, 0) / 60)}h{' '}
                  {task.timerSessions.reduce((total, session) => total + session.duration, 0) % 60}m
                </div>
              </div>
            )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
