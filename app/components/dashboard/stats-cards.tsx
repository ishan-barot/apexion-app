
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, TrendingUp, Flame } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalTasks: number
    completed: number
    inProgress: number
    todo: number
    todayCompleted: number
    streakDays: number
    productivityScore: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completed / stats.totalTasks) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <CheckCircle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTasks}</div>
          <p className="text-xs text-muted-foreground">
            {completionRate}% completion rate
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Productivity</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayCompleted}</div>
          <p className="text-xs text-muted-foreground">
            (tasks completed today)
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.streakDays}</div>
          <p className="text-xs text-muted-foreground">
            consecutive days
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
          <Clock className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{stats.productivityScore}</div>
            <Badge variant={stats.productivityScore >= 70 ? 'default' : stats.productivityScore >= 40 ? 'secondary' : 'destructive'}>
              {stats.productivityScore >= 70 ? 'High' : stats.productivityScore >= 40 ? 'Medium' : 'Low'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            out of 100
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
