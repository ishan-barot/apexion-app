
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

    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('fetch categories error:', error)
    return NextResponse.json({ error: 'failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, color } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color || '#3B82F6',
        userId: session.user.id,
        isDefault: false
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    // handle unique constraint violation
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json({ error: 'category name already exists' }, { status: 400 })
    }
    
    console.error('create category error:', error)
    return NextResponse.json({ error: 'failed to create category' }, { status: 500 })
  }
}
