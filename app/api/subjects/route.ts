
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subjects = await prisma.subject.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(subjects)
  } catch (error) {
    console.error('Failed to fetch subjects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, color } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Subject name is required' },
        { status: 400 }
      )
    }

    // Check if subject already exists for this user
    const existingSubject = await prisma.subject.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim()
      }
    })

    if (existingSubject) {
      return NextResponse.json(
        { error: 'A subject with this name already exists' },
        { status: 409 }
      )
    }

    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        color: color || '#3B82F6',
        userId: session.user.id
      }
    })

    console.log('Subject created successfully:', subject.name)
    return NextResponse.json(subject)
  } catch (error) {
    console.error('Failed to create subject:', error)
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    )
  }
}
