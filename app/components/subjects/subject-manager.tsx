
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Palette, Loader2, BookOpen, Timer, Play } from 'lucide-react'
import { Subject } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

interface SubjectManagerProps {
  subjects: Subject[]
  onSubjectCreated: (subject: Subject) => void
  onStartTimer?: (subject: Subject) => void
}

// more colors for subjects since students might have many
const colorOptions = [
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // yellow
  '#84CC16', // lime
  '#10B981', // green
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#6B7280', // gray
  '#059669', // emerald
  '#DC2626', // dark red
  '#7C3AED', // violet
  '#DB2777', // fuchsia
  '#0891B2'  // dark cyan
]

export default function SubjectManager({ subjects, onSubjectCreated, onStartTimer }: SubjectManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    color: colorOptions[0]
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    
    try {
      console.log('Creating subject:', formData.name.trim())
      
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          color: formData.color
        })
      })

      console.log('Subject creation response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
        console.error('Subject creation failed:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status} - Failed to create subject`)
      }

      const newSubject = await response.json()
      console.log('Subject created successfully:', newSubject.name)
      
      onSubjectCreated(newSubject)
      
      // reset form
      setFormData({ name: '', color: colorOptions[0] })
      setShowForm(false)
      
      toast({
        title: 'Subject Created Successfully',
        description: `${newSubject.name} added to your study subjects`
      })

    } catch (error) {
      console.error('Subject creation error:', error)
      toast({
        title: 'Failed to Create Subject',
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Study Subjects
        </CardTitle>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* existing subjects */}
        <div className="space-y-2">
          {subjects?.length > 0 ? (
            subjects.map(subject => (
              <div key={subject.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: subject.color }}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{subject.name}</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.floor(subject.totalTime / 60)}h {subject.totalTime % 60}m studied
                  </div>
                </div>
                {onStartTimer && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onStartTimer(subject)}
                    className="text-xs px-2 py-1 h-auto"
                    title={`start pomodoro timer for ${subject.name}`}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    study
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              no subjects yet. add one to start tracking study time!
            </p>
          )}
        </div>

        {/* new subject form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="subjectName" className="text-sm">Subject Name</Label>
              <Input
                id="subjectName"
                placeholder="e.g. Mathematics, Biology, History..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Color
              </Label>
              <div className="grid grid-cols-8 gap-1">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={loading || !formData.name.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    creating...
                  </>
                ) : (
                  'create subject'
                )}
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ name: '', color: colorOptions[0] })
                }}
              >
                cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
