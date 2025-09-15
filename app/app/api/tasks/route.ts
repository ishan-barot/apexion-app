
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'
import { updateProductivityScore } from '@/lib/productivity'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')

    let whereClause: any = { userId: session.user.id }

    if (status) {
      whereClause.status = status
    }
    if (categoryId) {
      whereClause.categoryId = categoryId
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: { 
        category: true,
        subject: true,
        timerSessions: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('fetch tasks error:', error)
    return NextResponse.json({ error: 'failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('Unauthorized request - no session')
      return NextResponse.json({ error: 'You must be logged in to create tasks' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Raw request body:', JSON.stringify(body, null, 2))
    
    const { title, description, priority, categoryId, subjectId, dueDate } = body

    console.log('Creating task with parsed data:', { 
      title, 
      description, 
      priority, 
      categoryId, 
      subjectId, 
      dueDate,
      userId: session.user.id 
    })

    // Validate required fields
    if (!title || title.trim() === '') {
      console.log('Validation failed: Title is missing or empty')
      return NextResponse.json({ error: 'Task title is required and cannot be empty' }, { status: 400 })
    }

    if (!categoryId || categoryId.trim() === '') {
      console.log('Validation failed: Category ID is missing or empty')
      return NextResponse.json({ error: 'Please select a category for your task' }, { status: 400 })
    }

    // Verify category exists and belongs to user
    console.log(`Looking for category with ID: ${categoryId} for user: ${session.user.id}`)
    const category = await prisma.category.findFirst({
      where: { 
        id: categoryId, 
        userId: session.user.id 
      }
    })

    if (!category) {
      console.log(`Category not found: ${categoryId} for user: ${session.user.id}`)
      // Let's also check what categories this user has
      const userCategories = await prisma.category.findMany({
        where: { userId: session.user.id },
        select: { id: true, name: true }
      })
      console.log('Available categories for user:', userCategories)
      return NextResponse.json({ 
        error: `The selected category does not exist. Please refresh the page and try again.`,
        availableCategories: userCategories 
      }, { status: 400 })
    }

    console.log(`Category found: ${category.name}`)

    // Handle subject validation if provided
    let subjectToUse = null
    if (subjectId && subjectId.trim() !== '' && subjectId !== 'none') {
      console.log(`Looking for subject with ID: ${subjectId} for user: ${session.user.id}`)
      const subject = await prisma.subject.findFirst({
        where: { 
          id: subjectId, 
          userId: session.user.id 
        }
      })

      if (!subject) {
        console.log(`Subject not found: ${subjectId} for user: ${session.user.id}`)
        // Let's check what subjects this user has
        const userSubjects = await prisma.subject.findMany({
          where: { userId: session.user.id },
          select: { id: true, name: true }
        })
        console.log('Available subjects for user:', userSubjects)
        return NextResponse.json({ 
          error: `The selected subject does not exist. Please refresh the page and try again.`,
          availableSubjects: userSubjects 
        }, { status: 400 })
      }
      console.log(`Subject found: ${subject.name}`)
      subjectToUse = subjectId
    }

    // Validate due date if provided
    let dueDateToUse = null
    if (dueDate) {
      try {
        dueDateToUse = new Date(dueDate)
        if (isNaN(dueDateToUse.getTime())) {
          throw new Error('Invalid date')
        }
        console.log(`Due date parsed: ${dueDateToUse.toISOString()}`)
      } catch (dateError) {
        console.log('Invalid due date provided:', dueDate, dateError)
        return NextResponse.json({ error: 'Invalid due date format. Please select a valid date.' }, { status: 400 })
      }
    }

    // Validate priority
    const priorityToUse = priority && typeof priority === 'number' && priority >= 1 && priority <= 4 ? priority : 1
    console.log(`Priority set to: ${priorityToUse}`)

    // Create the task
    console.log('Creating task in database...')
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priorityToUse,
        status: 'todo', // Always set new tasks to 'todo' status
        userId: session.user.id,
        categoryId: categoryId,
        subjectId: subjectToUse,
        dueDate: dueDateToUse,
      },
      include: { 
        category: true,
        subject: true,
        timerSessions: true
      }
    })

    console.log(`Task created successfully with ID: ${task.id}`)

    // Update daily stats
    try {
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
          tasksCreated: { increment: 1 }
        },
        create: {
          userId: session.user.id,
          date: today,
          tasksCreated: 1
        }
      })

      // Recalculate productivity score
      await updateProductivityScore(session.user.id)
      console.log('Daily stats and productivity score updated')
    } catch (statsError) {
      console.error('Error updating daily stats:', statsError)
      // Don't fail the task creation for stats errors
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Create task error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    })
    
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return NextResponse.json({ 
        error: 'Database constraint error. Please check that the category and subject exist and try again.' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: `Failed to create task: ${error instanceof Error ? error.message : 'Unknown error occurred'}` 
    }, { status: 500 })
  }
}
