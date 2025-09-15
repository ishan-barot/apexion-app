
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Zap, Bell, BarChart3, Timer, Calendar, Users } from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-600 mb-6 tracking-wider">
            APEXION
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Your smart productivity hub with AI powered task management, Pomodoro timers, study tracking, and comprehensive analytics to boost your focus!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="px-8 gap-2">
                <Zap className="h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 gap-2">
                <Users className="h-5 w-5" />
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <CheckCircle className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Smart Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create, organize and track tasks with categories, due dates, priorities, and color-coded organization
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <Timer className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle className="text-lg">Pomodoro Timer</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Customizable Pomodoro timer with task integration, break reminders, and productivity tracking
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <Bell className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle className="text-lg">Smart Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get browser notifications for upcoming deadlines, task reminders, and timer completions
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Analytics & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track completion rates, focus streaks, productivity trends, and commission calculations
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <Zap className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">AI Prioritization</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Let AI analyze your tasks and suggest optimal priorities based on deadlines and importance
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <Calendar className="h-8 w-8 text-indigo-600 mb-2" />
              <CardTitle className="text-lg">Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualize your tasks on a calendar with due dates, completion tracking, and timeline view
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <Users className="h-8 w-8 text-teal-600 mb-2" />
              <CardTitle className="text-lg">Study Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create and manage study subjects with color coding and track time spent on each topic
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <Zap className="h-8 w-8 text-pink-600 mb-2" />
              <CardTitle className="text-lg">Focus Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Distraction-free environment with celebration effects and productivity celebrations
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to boost your productivity? 🚀
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Transform how you manage tasks, track your focus time, and achieve your goals with Apexion
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="px-12 gap-2">
                <Zap className="h-5 w-5" />
                Start Free Today
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 gap-2">
                <Users className="h-5 w-5" />
                I Have an Account
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            No credit card required • Free forever • Start in 30 seconds
          </p>
        </div>

        {/* Creator Credit */}
        <div className="text-center mt-12 pb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Created by <span className="font-semibold text-gray-700 dark:text-gray-300">Ishan Barot</span>
          </p>
        </div>
      </div>
    </div>
  )
}
