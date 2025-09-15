
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'
import { updateProductivityScore } from '@/lib/productivity'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const taskId = params.id
    const body = await request.json()
    const { title, description, priority, categoryId, subjectId, dueDate, status, timeSpent } = body

    // verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId: session.user.id }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'task not found' }, { status: 404 })
    }

    // if categoryId is being changed, verify it belongs to user
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId: session.user.id }
      })

      if (!category) {
        return NextResponse.json({ error: 'invalid category' }, { status: 400 })
      }
    }

    // if subjectId is being changed, verify it belongs to user
    if (subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { id: subjectId, userId: session.user.id }
      })

      if (!subject) {
        return NextResponse.json({ error: 'invalid subject' }, { status: 400 })
      }
    }

    // check if task is being completed
    const wasCompleted = existingTask.status === 'completed'
    const isNowCompleted = status === 'completed'

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (priority !== undefined) updateData.priority = priority
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (subjectId !== undefined) updateData.subjectId = subjectId
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (timeSpent !== undefined) updateData.timeSpent = Math.max(0, timeSpent) // ensure non-negative
    if (status !== undefined) {
      updateData.status = status
      if (isNowCompleted && !wasCompleted) {
        updateData.completedAt = new Date()
      } else if (!isNowCompleted && wasCompleted) {
        updateData.completedAt = null
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: { 
        category: true,
        subject: true,
        timerSessions: true
      }
    })

    // update daily stats if task completed
    if (isNowCompleted && !wasCompleted) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      await prisma.dailyStats.upsert({
        where: {
          userId_date: {
            userId: session.user.id,
            date: today
          }
        },
        update: {
          tasksCompleted: { increment: 1 }
        },
        create: {
          userId: session.user.id,
          date: today,
          tasksCompleted: 1
        }
      })

      // recalculate productivity score after completing a task
      await updateProductivityScore(session.user.id)
    }

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('update task error:', error)
    return NextResponse.json({ error: 'failed to update task' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const taskId = params.id

    // verify task belongs to user and delete
    const deletedTask = await prisma.task.deleteMany({
      where: {
        id: taskId,
        userId: session.user.id
      }
    })

    if (deletedTask.count === 0) {
      return NextResponse.json({ error: 'task not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'task deleted successfully' })
  } catch (error) {
    console.error('delete task error:', error)
    return NextResponse.json({ error: 'failed to delete task' }, { status: 500 })
  }
}
