

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { updateProductivityScore } from '@/lib/productivity'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    // Recalculate productivity score for the current user
    await updateProductivityScore(session.user.id)

    return NextResponse.json({ 
      message: 'productivity score recalculated successfully' 
    })
  } catch (error) {
    console.error('recalculate productivity error:', error)
    return NextResponse.json({ 
      error: 'failed to recalculate productivity score' 
    }, { status: 500 })
  }
}
