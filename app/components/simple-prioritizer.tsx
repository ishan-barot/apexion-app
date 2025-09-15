

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Loader2, ArrowUpDown, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SimplePrioritizerProps {
  onPrioritizationComplete: () => void
}

export default function SimplePrioritizer({ onPrioritizationComplete }: SimplePrioritizerProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const { toast } = useToast()

  const handlePrioritize = async () => {
    setIsProcessing(true)
    setProgress(0)
    setResult(null)
    setShowModal(true)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 20, 90))
      }, 200)

      const response = await fetch('/api/prioritize', {
        method: 'POST'
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('Failed to prioritize tasks')
      }

      const data = await response.json()
      setProgress(100)
      setResult(data)
      onPrioritizationComplete()
      
      toast({ 
        description: 'Task priorities updated successfully!',
        duration: 3000
      })

    } catch (error) {
      console.error('Prioritization error:', error)
      toast({
        title: 'Prioritization failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
      setTimeout(() => {
        setShowModal(false)
        setProgress(0)
        setResult(null)
      }, 3000)
    }
  }

  return (
    <>
      <Button
        onClick={handlePrioritize}
        disabled={isProcessing}
        className="gap-2"
        variant="outline"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <ArrowUpDown className="h-4 w-4" />
            Prioritize
          </>
        )}
      </Button>

      {/* Processing modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Smart Task Prioritization
              </CardTitle>
              <CardDescription>
                Analyzing your tasks to suggest optimal priorities
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {isProcessing && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing task importance, deadlines, and patterns...
                </div>
              )}

              {result && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Analysis complete!</span>
                  </div>
                  
                  {result.tasks && result.tasks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Priority updates:</p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {result.tasks.slice(0, 3).map((taskUpdate: any, index: number) => (
                          <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                            <div className="font-medium truncate">{taskUpdate.title || 'Task'}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Priority: {taskUpdate.newPriority}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {result.tasks.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{result.tasks.length - 3} more tasks updated
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowModal(false)}
                  disabled={isProcessing}
                >
                  {result ? 'Close' : 'Cancel'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
