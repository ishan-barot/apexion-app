
import { prisma } from '@/lib/db'

export interface ProductivityData {
  tasksCompleted: number
  tasksCreated: number
  streakDays: number
  todayCompleted: number
}

/**
 * Calculate productivity score based on task completion, consistency, and daily performance
 * Formula: (completion * 40%) + (completion_rate * 30%) + (streak * 20%) + (today * 10%)
 */
export function calculateProductivityScore({
  tasksCompleted,
  tasksCreated,
  streakDays,
  todayCompleted
}: ProductivityData): number {
  // Base score for completion (40% weight)
  const completionScore = tasksCompleted * 4

  // Completion rate score (30% weight) - how well you finish what you start
  const completionRate = Math.min(tasksCompleted / Math.max(tasksCreated, 1), 1)
  const completionRateScore = completionRate * 30

  // Consistency bonus (20% weight) - reward for maintaining streaks
  const consistencyScore = Math.min(streakDays * 2, 20) // cap at 20 points

  // Today's productivity bonus (10% weight) - immediate motivation
  const todayScore = Math.min(todayCompleted * 3, 10) // cap at 10 points

  const totalScore = completionScore + completionRateScore + consistencyScore + todayScore

  // Cap at 100 and round to nearest integer
  return Math.min(100, Math.round(totalScore))
}

/**
 * Calculate streak days for a user
 */
export async function calculateStreakDays(userId: string): Promise<number> {
  try {
    // Get all daily stats ordered by date descending
    const dailyStats = await prisma.dailyStats.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30 // Look back 30 days max for performance
    })

    if (dailyStats.length === 0) return 0

    let streakDays = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if user has activity today or yesterday (allow for different timezones)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let currentDate = today
    let hasFoundToday = false

    // Check if there's activity today
    const todayStats = dailyStats.find(stat => 
      stat.date.getTime() === today.getTime()
    )
    if (todayStats && todayStats.tasksCompleted > 0) {
      hasFoundToday = true
      streakDays = 1
      currentDate = new Date(today)
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      // Start checking from yesterday
      currentDate = yesterday
    }

    // Count consecutive days with completed tasks
    for (const stat of dailyStats) {
      if (stat.date.getTime() === currentDate.getTime() && stat.tasksCompleted > 0) {
        if (!hasFoundToday) {
          hasFoundToday = true
          streakDays = 1
        } else {
          streakDays++
        }
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (stat.date.getTime() === currentDate.getTime() && stat.tasksCompleted === 0) {
        // Found a day with no completed tasks, streak is broken
        break
      }
    }

    return streakDays
  } catch (error) {
    console.error('Error calculating streak:', error)
    return 0
  }
}

/**
 * Update productivity score and streak for a user
 */
export async function updateProductivityScore(userId: string): Promise<void> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get current daily stats
    const todayStats = await prisma.dailyStats.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    })

    if (!todayStats) {
      // No stats for today yet, create with default values
      await prisma.dailyStats.create({
        data: {
          userId,
          date: today,
          tasksCompleted: 0,
          tasksCreated: 0,
          productivityScore: 0,
          streakDays: 0
        }
      })
      return
    }

    // Calculate streak days
    const streakDays = await calculateStreakDays(userId)

    // Get today's completed tasks count
    const todayCompleted = todayStats.tasksCompleted

    // Calculate productivity score
    const productivityScore = calculateProductivityScore({
      tasksCompleted: todayStats.tasksCompleted,
      tasksCreated: todayStats.tasksCreated,
      streakDays,
      todayCompleted
    })

    // Update the daily stats
    await prisma.dailyStats.update({
      where: {
        userId_date: {
          userId,
          date: today
        }
      },
      data: {
        productivityScore,
        streakDays
      }
    })

  } catch (error) {
    console.error('Error updating productivity score:', error)
  }
}
