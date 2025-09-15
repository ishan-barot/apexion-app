
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'

// create timer session
export async function POST(request: Request) {
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
    const { taskId, duration, sessionType, subjectId } = body

    if (!taskId || !duration) {
      return NextResponse.json({ error: 'taskId and duration are required' }, { status: 400 })
    }

    // create timer session
    const timerSession = await prisma.timerSession.create({
      data: {
        taskId,
        userId: user.id,
        startTime: new Date(Date.now() - (duration * 60 * 1000)), // backdate start time
        endTime: new Date(),
        duration,
        sessionType: sessionType || 'work',
        isActive: false
      }
    })

    // always update task timeSpent if it's a work session
    if (taskId && sessionType === 'work') {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          timeSpent: { increment: duration }
        }
      })
    }

    // if this is a study session, update subject total time and create study session
    if (subjectId && sessionType === 'work') {
      // update subject total time
      await prisma.subject.update({
        where: { id: subjectId },
        data: {
          totalTime: { increment: duration }
        }
      })

      // create or update study session for today
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      await prisma.studySession.upsert({
        where: {
          userId_subjectId_date: {
            userId: user.id,
            subjectId: subjectId,
            date: today
          }
        },
        update: {
          duration: { increment: duration }
        },
        create: {
          userId: user.id,
          subjectId: subjectId,
          date: today,
          duration: duration
        }
      })
    }

    return NextResponse.json(timerSession)

  } catch (error) {
    console.error('create timer session error:', error)
    return NextResponse.json({ error: 'failed to create timer session' }, { status: 500 })
  }
}

// get timer sessions for a task
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    const subjectId = searchParams.get('subjectId')

    let whereClause: any = { userId: user.id }
    
    if (taskId) {
      whereClause.taskId = taskId
    }
    
    if (subjectId) {
      // need to get tasks that belong to this subject
      const tasks = await prisma.task.findMany({
        where: { userId: user.id, subjectId },
        select: { id: true }
      })
      whereClause.taskId = { in: tasks.map(t => t.id) }
    }

    const timerSessions = await prisma.timerSession.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        task: {
          include: {
            category: true,
            subject: true
          }
        }
      }
    })

    return NextResponse.json(timerSessions)

  } catch (error) {
    console.error('get timer sessions error:', error)
    return NextResponse.json({ error: 'failed to fetch timer sessions' }, { status: 500 })
  }
}
