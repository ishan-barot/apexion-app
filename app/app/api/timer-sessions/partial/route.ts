

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'

// Update task time spent when timer is paused/stopped mid-session
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 })
    }

    const body = await request.json()
    const { taskId, minutesElapsed } = body

    if (!taskId || minutesElapsed === undefined) {
      return NextResponse.json({ error: 'taskId and minutesElapsed are required' }, { status: 400 })
    }

    // Only update if there's actual time elapsed
    if (minutesElapsed > 0) {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          timeSpent: { increment: minutesElapsed }
        }
      })

      // Also update subject total time if the task has a subject
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { subject: true }
      })

      if (task?.subject) {
        await prisma.subject.update({
          where: { id: task.subject.id },
          data: {
            totalTime: { increment: minutesElapsed }
          }
        })

        // Update study session for today
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        await prisma.studySession.upsert({
          where: {
            userId_subjectId_date: {
              userId: user.id,
              subjectId: task.subject.id,
              date: today
            }
          },
          update: {
            duration: { increment: minutesElapsed }
          },
          create: {
            userId: user.id,
            subjectId: task.subject.id,
            date: today,
            duration: minutesElapsed
          }
        })
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('partial time update error:', error)
    return NextResponse.json({ error: 'failed to update time' }, { status: 500 })
  }
}
