
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    // get tasks with categories
    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // get categories
    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    })

    // calculate stats
    const totalTasks = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const todo = tasks.filter(t => t.status === 'todo').length

    // today's completed tasks
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCompleted = tasks.filter(t => 
      t.completedAt && 
      new Date(t.completedAt) >= today
    ).length

    // get streak and productivity from daily stats
    const latestStats = await prisma.dailyStats.findFirst({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' }
    })

    const stats = {
      totalTasks,
      completed,
      inProgress,
      todo,
      todayCompleted,
      streakDays: latestStats?.streakDays || 0,
      productivityScore: latestStats?.productivityScore || 0
    }

    return NextResponse.json({
      tasks,
      categories,
      stats
    })

  } catch (error) {
    console.error('dashboard error:', error)
    return NextResponse.json({ error: 'failed to fetch dashboard data' }, { status: 500 })
  }
}
