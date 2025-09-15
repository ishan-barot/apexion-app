
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = body

    if (!email || !password || !firstName) {
      return NextResponse.json(
        { error: 'missing required fields' },
        { status: 400 }
      )
    }

    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'user already exists' },
        { status: 400 }
      )
    }

    // hash password
    const hashedPassword = await bcryptjs.hash(password, 10)

    // create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName || ''}`.trim()
      }
    })

    // create default categories for new user
    const defaultCategories = [
      { name: 'Work', color: '#3B82F6', isDefault: true },
      { name: 'Personal', color: '#10B981', isDefault: true },
      { name: 'Health', color: '#F59E0B', isDefault: true },
      { name: 'Study', color: '#8B5CF6', isDefault: true },
    ]

    await Promise.all(
      defaultCategories.map(cat =>
        prisma.category.create({
          data: {
            ...cat,
            userId: user.id
          }
        })
      )
    )

    return NextResponse.json({
      message: 'user created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error('signup error:', error)
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    )
  }
}
