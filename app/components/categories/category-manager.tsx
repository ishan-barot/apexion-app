
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Palette, Loader2 } from 'lucide-react'
import { Category } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

interface CategoryManagerProps {
  categories: Category[]
  onCategoryCreated: (category: Category) => void
}

const colorOptions = [
  '#3B82F6', // blue
  '#10B981', // green  
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#F97316', // orange
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#EC4899', // pink
  '#6B7280'  // gray
]

export default function CategoryManager({ categories, onCategoryCreated }: CategoryManagerProps) {
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
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          color: formData.color
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'failed to create category')
      }

      const newCategory = await response.json()
      onCategoryCreated(newCategory)
      
      // reset form
      setFormData({ name: '', color: colorOptions[0] })
      setShowForm(false)

    } catch (error) {
      console.error('category creation error:', error)
      toast({
        title: 'error',
        description: error instanceof Error ? error.message : 'failed to create category',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Categories</CardTitle>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* existing categories */}
        <div className="space-y-2">
          {categories?.map(category => (
            <div key={category.id} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm flex-1">{category.name}</span>
              {category.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  default
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* new category form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="categoryName" className="text-sm">Name</Label>
              <Input
                id="categoryName"
                placeholder="e.g. Shopping"
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
              <div className="grid grid-cols-5 gap-2">
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
                  'create'
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
