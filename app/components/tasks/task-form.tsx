
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Loader2, X, Calendar, AlertTriangle, Timer, Plus } from 'lucide-react'
import { TaskWithCategory, Category, Subject, CreateTaskData, UpdateTaskData } from '@/lib/types'
import { format, set } from 'date-fns'
import { cn } from '@/lib/utils'

interface TaskFormProps {
  categories: Category[]
  subjects: Subject[]
  editingTask?: TaskWithCategory | null
  onSubmit: (task: TaskWithCategory) => void
  onCancel: () => void
}

export default function TaskForm({ categories, subjects, editingTask, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 1,
    categoryId: '',
    subjectId: '',
    dueDate: '',
    status: 'todo'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [showNewSubjectInput, setShowNewSubjectInput] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [subjectLoading, setSubjectLoading] = useState(false)
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>(subjects || [])

  // populate form when editing
  useEffect(() => {
    if (editingTask) {
      const dueDateValue = editingTask.dueDate ? new Date(editingTask.dueDate) : undefined
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 1,
        categoryId: editingTask.categoryId || '',
        subjectId: editingTask.subjectId || '',
        dueDate: dueDateValue ? dueDateValue.toISOString() : '',
        status: editingTask.status || 'todo'
      })
      setSelectedDate(dueDateValue)
    }
  }, [editingTask])

  // update available subjects when subjects prop changes
  useEffect(() => {
    setAvailableSubjects(subjects || [])
  }, [subjects])

  const createNewSubject = async () => {
    if (!newSubjectName.trim()) return
    
    setSubjectLoading(true)
    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubjectName.trim() })
      })

      if (!response.ok) {
        throw new Error('Failed to create subject')
      }

      const newSubject = await response.json()
      setAvailableSubjects(prev => [...prev, newSubject])
      setFormData(prev => ({ ...prev, subjectId: newSubject.id }))
      setNewSubjectName('')
      setShowNewSubjectInput(false)
    } catch (err) {
      setError('Failed to create new subject')
    } finally {
      setSubjectLoading(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Set time to 11:59 PM by default
      const dateWithTime = set(date, { 
        hours: 23, 
        minutes: 59, 
        seconds: 0, 
        milliseconds: 0 
      })
      setSelectedDate(dateWithTime)
      setFormData(prev => ({ ...prev, dueDate: dateWithTime.toISOString() }))
    } else {
      setSelectedDate(undefined)
      setFormData(prev => ({ ...prev, dueDate: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.title.trim()) {
      setError('Title is required')
      setLoading(false)
      return
    }

    if (!formData.categoryId) {
      setError('Please select a category')
      setLoading(false)
      return
    }

    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks'
      const method = editingTask ? 'PUT' : 'POST'

      const payload: CreateTaskData | UpdateTaskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        categoryId: formData.categoryId,
        subjectId: formData.subjectId || undefined,
        dueDate: selectedDate,
        ...(editingTask && { status: formData.status })
      }

      console.log('Submitting task:', JSON.stringify(payload, null, 2))

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log('Task submission response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
        console.error('Task submission error:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status} - Failed to save task`)
      }

      const savedTask = await response.json()
      console.log('Task saved successfully:', savedTask.id)
      onSubmit(savedTask)

    } catch (err) {
      console.error('Task form submission error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong while saving the task'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const priorityOptions = [
    { value: 1, label: 'Low', color: 'text-gray-600' },
    { value: 2, label: 'Medium', color: 'text-blue-600' },
    { value: 3, label: 'High', color: 'text-orange-600' },
    { value: 4, label: 'Urgent', color: 'text-red-600' }
  ]

  const statusOptions = editingTask ? [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ] : []

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          {/* title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          {/* description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* category and priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.categoryId || ''} 
                onValueChange={(value) => handleChange('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={formData.priority.toString()} 
                onValueChange={(value) => handleChange('priority', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <span className={option.color}>{option.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* subject selection - show for all categories */}
          <div className="space-y-2">
            <Label>Subject (Optional)</Label>
              {!showNewSubjectInput ? (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select 
                      value={formData.subjectId || 'none'} 
                      onValueChange={(value) => {
                        if (value === 'create-new') {
                          setShowNewSubjectInput(true)
                        } else {
                          handleChange('subjectId', value === 'none' ? '' : value)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No subject</SelectItem>
                        {availableSubjects?.map(subject => (
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
                        <SelectItem value="create-new" className="text-blue-600">
                          <div className="flex items-center gap-2">
                            <Plus className="h-3 w-3" />
                            Create new subject
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter subject name (e.g., Biology, Chemistry)"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        createNewSubject()
                      }
                      if (e.key === 'Escape') {
                        setShowNewSubjectInput(false)
                        setNewSubjectName('')
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={createNewSubject}
                    disabled={!newSubjectName.trim() || subjectLoading}
                  >
                    {subjectLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Add'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewSubjectInput(false)
                      setNewSubjectName('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              <p className="text-xs text-gray-500">
                <Timer className="h-3 w-3 inline mr-1" />
                Subjects help organize tasks and track time
              </p>
            </div>

          {/* due date and status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      <div className="flex flex-col">
                        <span>{format(selectedDate, "PPP")}</span>
                        <span className="text-xs text-gray-500">
                          {format(selectedDate, "p")}
                        </span>
                      </div>
                    ) : (
                      "Pick a date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                  {selectedDate && (
                    <div className="p-3 border-t">
                      <Label className="text-sm font-medium">Time</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="time"
                          value={selectedDate ? format(selectedDate, "HH:mm") : "23:59"}
                          onChange={(e) => {
                            if (selectedDate) {
                              const [hours, minutes] = e.target.value.split(':').map(Number)
                              const newDate = set(selectedDate, { hours, minutes })
                              setSelectedDate(newDate)
                              setFormData(prev => ({ ...prev, dueDate: newDate.toISOString() }))
                            }
                          }}
                          className="w-24"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDateSelect(undefined)}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-500">
                Time defaults to 11:59 PM if not specified
              </p>
            </div>

            {editingTask && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* form actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                editingTask ? 'Update Task' : 'Create Task'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
