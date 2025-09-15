
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { BarChart3, Calendar } from 'lucide-react'

interface ProductivityData {
  date: string
  completed: number
  created: number
  score: number
}

interface ProductivityChartProps {
  className?: string
}

export default function ProductivityChart({ className }: ProductivityChartProps) {
  const [data, setData] = useState<ProductivityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProductivityData()
  }, [])

  const fetchProductivityData = async () => {
    try {
      const response = await fetch('/api/dashboard/productivity')
      if (response.ok) {
        const productivityData = await response.json()
        setData(productivityData)
      }
    } catch (error) {
      console.error('failed to fetch productivity data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Productivity Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // generate sample data if none available (for demo purposes)
  const chartData = data.length > 0 ? data : generateSampleData()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Productivity Trends
        </CardTitle>
        <CardDescription>
          your task completion patterns over the last week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <XAxis 
              dataKey="date" 
              tickLine={false}
              tick={{ fontSize: 10 }}
              axisLine={false}
            />
            <YAxis 
              tickLine={false}
              tick={{ fontSize: 10 }}
              axisLine={false}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 border rounded-lg shadow-md">
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-green-600">
                        Completed: {payload[0]?.value || 0}
                      </p>
                      <p className="text-sm text-blue-600">
                        Created: {payload[1]?.value || 0}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="created" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>completed</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>created</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// generates sample data for demo purposes - casual ishan style
function generateSampleData(): ProductivityData[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map(day => ({
    date: day,
    completed: Math.floor(Math.random() * 8) + 1, // 1-8 tasks
    created: Math.floor(Math.random() * 5) + 2,   // 2-6 tasks  
    score: Math.floor(Math.random() * 40) + 60    // 60-100 score
  }))
}
