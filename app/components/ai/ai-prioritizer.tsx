
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Zap, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AiPrioritizerProps {
  onPrioritizationComplete: () => void
}

export default function AiPrioritizer({ onPrioritizationComplete }: AiPrioritizerProps) {
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
      const response = await fetch('/api/ai/prioritize', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('failed to start ai prioritization')
      }

      // handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let partialRead = ''

      while (true) {
        const { done, value } = await reader?.read() || { done: true, value: null }
        if (done) break

        partialRead += decoder.decode(value, { stream: true })
        let lines = partialRead.split('\n')
        partialRead = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              return
            }

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.status === 'processing') {
                setProgress(prev => Math.min(prev + 10, 90))
              } else if (parsed.status === 'completed') {
                setProgress(100)
                setResult(parsed.result)
                onPrioritizationComplete()
                toast({ 
                  description: 'task priorities updated successfully!',
                  duration: 3000
                })
                return
              } else if (parsed.status === 'error') {
                throw new Error(parsed.message || 'ai processing failed')
              }
            } catch (e) {
              // skip invalid json lines
            }
          }
        }
      }

    } catch (error) {
      console.error('ai prioritization error:', error)
      toast({
        title: 'ai prioritization failed',
        description: error instanceof Error ? error.message : 'something went wrong',
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
        className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            analyzing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            ai prioritize
          </>
        )}
      </Button>

      {/* ai processing modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                AI Task Prioritization
              </CardTitle>
              <CardDescription>
                analyzing your tasks to suggest optimal priorities
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
                  ai is analyzing task importance, deadlines, and patterns...
                </div>
              )}

              {result && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">analysis complete!</span>
                  </div>
                  
                  {result.tasks && result.tasks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">priority updates:</p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {result.tasks.slice(0, 3).map((taskUpdate: any, index: number) => (
                          <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                            <div className="font-medium truncate">{taskUpdate.title || 'Task'}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                priority: {taskUpdate.suggestedPriority}
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
                  {result ? 'close' : 'cancel'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
