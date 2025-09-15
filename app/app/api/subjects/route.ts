

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subjects = await prisma.subject.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { name: 'asc' }
      ]
    })

    return NextResponse.json(subjects)
  } catch (error) {
    console.error('Fetch subjects error:', error)
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('Unauthorized request - no session')
      return NextResponse.json({ error: 'You must be logged in to create subjects' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Creating subject with data:', body)
    
    const { name, color } = body

    if (!name || name.trim() === '') {
      console.log('Validation failed: Subject name is missing or empty')
      return NextResponse.json({ error: 'Subject name is required' }, { status: 400 })
    }

    // Check if subject with this name already exists for this user
    const existingSubject = await prisma.subject.findFirst({
      where: { 
        name: name.trim(),
        userId: session.user.id 
      }
    })

    if (existingSubject) {
      console.log(`Subject already exists: ${name.trim()}`)
      return NextResponse.json({ 
        error: `Subject "${name.trim()}" already exists. Please choose a different name.` 
      }, { status: 400 })
    }

    // Generate a random color if not provided
    const colors = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E']
    const subjectColor = color || colors[Math.floor(Math.random() * colors.length)]

    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        color: subjectColor,
        userId: session.user.id,
      }
    })

    console.log(`Subject created successfully: ${subject.name} (${subject.id})`)
    return NextResponse.json(subject)

  } catch (error) {
    console.error('Create subject error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    })
    
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json({ 
        error: 'A subject with this name already exists. Please choose a different name.' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: `Failed to create subject: ${error instanceof Error ? error.message : 'Unknown error occurred'}` 
    }, { status: 500 })
  }
}

