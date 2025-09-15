

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's tasks that need prioritization
    const tasks = await prisma.task.findMany({
      where: { 
        userId: session.user.id,
        status: { not: 'completed' }
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    })

    if (tasks.length === 0) {
      return NextResponse.json({ message: 'No tasks to prioritize', tasks: [] })
    }

    // Smart prioritization algorithm (no AI needed)
    const now = new Date()
    const oneDayMs = 24 * 60 * 60 * 1000
    const updatedTasks = []

    for (const task of tasks) {
      let newPriority = task.priority
      
      // Prioritize based on due date
      if (task.dueDate) {
        const daysUntilDue = (task.dueDate.getTime() - now.getTime()) / oneDayMs
        
        if (daysUntilDue < 0) {
          // Overdue tasks get urgent priority
          newPriority = 4
        } else if (daysUntilDue <= 1) {
          // Due today or tomorrow
          newPriority = Math.max(newPriority, 3)
        } else if (daysUntilDue <= 3) {
          // Due within 3 days
          newPriority = Math.max(newPriority, 2)
        }
      }

      // Boost priority for work-related categories during work hours
      const currentHour = now.getHours()
      if (currentHour >= 9 && currentHour <= 17) {
        const workCategories = ['work', 'professional', 'business', 'project']
        if (workCategories.some(cat => task.category.name.toLowerCase().includes(cat))) {
          newPriority = Math.max(newPriority, 2)
        }
      }

      // Update task priority if it changed
      if (newPriority !== task.priority) {
        await prisma.task.update({
          where: { id: task.id },
          data: { priority: newPriority }
        })
        
        updatedTasks.push({
          id: task.id,
          title: task.title,
          oldPriority: task.priority,
          newPriority: newPriority
        })
      }
    }

    return NextResponse.json({
      message: `Updated ${updatedTasks.length} task priorities`,
      tasks: updatedTasks
    })

  } catch (error) {
    console.error('Prioritization error:', error)
    return NextResponse.json({ error: 'Prioritization failed' }, { status: 500 })
  }
}
