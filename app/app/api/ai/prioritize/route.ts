
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    // get user's tasks that need prioritization
    const tasks = await prisma.task.findMany({
      where: { 
        userId: session.user.id,
        status: { not: 'completed' }
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    })

    if (tasks.length === 0) {
      return NextResponse.json({ message: 'no tasks to prioritize' })
    }

    // prepare task data for ai analysis
    const taskData = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      category: task.category.name,
      currentPriority: task.priority,
      dueDate: task.dueDate?.toISOString() || null,
      status: task.status,
      createdAt: task.createdAt.toISOString()
    }))

    const prompt = `You are a productivity expert. analyze these tasks and suggest optimal priorities (1=low, 2=medium, 3=high, 4=urgent).

Consider:
- due dates (upcoming deadlines = higher priority)  
- task categories (work tasks during work hours, health tasks consistently)
- current status and user patterns
- importance vs urgency matrix

Tasks to analyze:
${JSON.stringify(taskData, null, 2)}

Respond in JSON format with this structure:
{
  "tasks": [
    {
      "taskId": "task_id_here",
      "suggestedPriority": 3,
      "reasoning": "short explanation for priority change"
    }
  ]
}

Focus on practical prioritization. Only suggest changes where there's clear benefit. Respond with raw JSON only.`

    // call the llm api with streaming
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    })

    if (!response.ok) {
      throw new Error('ai service error')
    }

    // stream response back to client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        
        let buffer = ''
        let partialRead = ''

        try {
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
                  // process the complete response
                  try {
                    const aiResult = JSON.parse(buffer)
                    
                    // update task priorities in database
                    if (aiResult.tasks && Array.isArray(aiResult.tasks)) {
                      const updatePromises = aiResult.tasks.map(async (taskUpdate: any) => {
                        if (taskUpdate.taskId && typeof taskUpdate.suggestedPriority === 'number') {
                          await prisma.task.update({
                            where: { id: taskUpdate.taskId },
                            data: { 
                              aiPriority: taskUpdate.suggestedPriority,
                              priority: taskUpdate.suggestedPriority // also update the actual priority
                            }
                          })
                        }
                      })
                      
                      await Promise.all(updatePromises)
                    }

                    const finalData = JSON.stringify({
                      status: 'completed',
                      result: aiResult,
                      message: 'task priorities updated successfully'
                    })
                    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
                  } catch (parseError) {
                    console.error('json parse error:', parseError)
                    const errorData = JSON.stringify({
                      status: 'error',
                      message: 'failed to process ai response'
                    })
                    controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
                  }
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  buffer += parsed.choices?.[0]?.delta?.content || ''
                  
                  // send progress update
                  const progressData = JSON.stringify({
                    status: 'processing',
                    message: 'analyzing tasks...'
                  })
                  controller.enqueue(encoder.encode(`data: ${progressData}\n\n`))
                } catch (e) {
                  // skip invalid json chunks
                }
              }
            }
          }
        } catch (error) {
          console.error('stream error:', error)
          const errorData = JSON.stringify({
            status: 'error',
            message: 'ai processing failed'
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('ai prioritize error:', error)
    return NextResponse.json({ error: 'ai prioritization failed' }, { status: 500 })
  }
}
