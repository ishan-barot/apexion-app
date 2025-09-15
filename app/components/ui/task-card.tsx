import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Checkbox } from './checkbox'
import { Button } from './button'
import { Pencil, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface TaskCardProps {
  id: string
  title: string
  description?: string
  category: string
  categoryColor?: string
  subject?: {
    name: string
    color: string
  }
  completed: boolean
  onComplete: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

export function TaskCard({
  id,
  title,
  description,
  category,
  categoryColor,
  subject,
  completed,
  onComplete,
  onDelete,
  onEdit,
}: TaskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`w-full ${completed ? 'opacity-60' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={completed}
              onCheckedChange={(checked) => onComplete(id, checked as boolean)}
            />
            <CardTitle className={`text-lg ${completed ? 'line-through' : ''}`}>
              {title}
            </CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(id)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <div className="flex gap-2 mt-2">
            {subject ? (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1"
                style={{ backgroundColor: subject.color + '20', color: subject.color }}
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: subject.color }}
                />
                {subject.name}
              </Badge>
            ) : (
              <Badge 
                variant="secondary" 
                className={categoryColor ? 'flex items-center gap-1' : ''}
                style={categoryColor ? { backgroundColor: categoryColor + '20', color: categoryColor } : {}}
              >
                {categoryColor && (
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: categoryColor }}
                  />
                )}
                {category}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}