
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

    // get last 7 days of stats
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: sevenDaysAgo
        }
      },
      orderBy: { date: 'asc' }
    })

    // format data for chart
    const chartData = dailyStats.map(stat => ({
      date: stat.date.toLocaleDateString('en-US', { weekday: 'short' }),
      completed: stat.tasksCompleted,
      created: stat.tasksCreated,
      score: stat.productivityScore
    }))

    return NextResponse.json(chartData)
  } catch (error) {
    console.error('productivity data error:', error)
    return NextResponse.json({ error: 'failed to fetch productivity data' }, { status: 500 })
  }
}
