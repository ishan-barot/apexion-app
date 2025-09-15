
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Clock, 
  Plus, 
  Zap, 
  Bell, 
  Settings,
  LogOut,
  BarChart3,
  Calendar
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { DashboardData, TaskWithCategory, Category, Subject } from '@/lib/types'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import TaskList from '@/components/tasks/task-list'
import TaskForm from '@/components/tasks/task-form'
import StatsCards from '@/components/dashboard/stats-cards'
import ProductivityChart from '@/components/dashboard/productivity-chart'
import CategoryManager from '@/components/categories/category-manager'
import SubjectManager from '@/components/subjects/subject-manager'
import SimplePrioritizer from '@/components/simple-prioritizer'
import NotificationManager from '@/components/notifications/notification-manager'

import PomodoroTimer from '@/components/timer/pomodoro-timer'
import CalendarView from '@/components/calendar/calendar-view'
import CelebrationEffect from '@/components/effects/celebration-effect'
import TroubleshootingGuide from '@/components/ui/troubleshooting-guide'
import { useToast } from '@/hooks/use-toast'

export default function Dashboard() {
  const { data: session, status } = useSession() || {}
  const [data, setData] = useState<DashboardData | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithCategory | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [timerTask, setTimerTask] = useState<TaskWithCategory | null>(null)
  const [timerSubject, setTimerSubject] = useState<Subject | null>(null)
  const [showTimer, setShowTimer] = useState(false)
  const [activeMainTab, setActiveMainTab] = useState('tasks') // 'tasks', 'calendar'
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationMessage, setCelebrationMessage] = useState('')
  const [celebrationType, setCelebrationType] = useState<'task' | 'timer' | 'streak' | 'achievement'>('task')
  const { toast } = useToast()

  // fetch dashboard data
  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('Fetching dashboard data...')
      
      const [dashboardResponse, subjectsResponse] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/subjects')
      ])
      
      console.log('Dashboard response status:', dashboardResponse.status)
      console.log('Subjects response status:', subjectsResponse.status)
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json()
        console.log('Dashboard data received:', dashboardData)
        setData(dashboardData)
      } else {
        const errorData = await dashboardResponse.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Dashboard fetch error:', errorData)
        throw new Error(errorData.error || `HTTP ${dashboardResponse.status}`)
      }
      
      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json()
        console.log('Subjects data received:', subjectsData.length, 'subjects')
        setSubjects(subjectsData)
      } else {
        const errorData = await subjectsResponse.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Subjects fetch error:', errorData)
        // Don't throw here - subjects are not critical
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast({ 
        title: 'Loading Error', 
        description: error instanceof Error ? error.message : 'Failed to load dashboard data. Please refresh the page.',
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchData()
    }
  }, [session])

  const handleTaskCreated = (newTask: TaskWithCategory) => {
    setData(prev => prev ? {
      ...prev,
      tasks: [newTask, ...prev.tasks],
      stats: {
        ...prev.stats,
        totalTasks: prev.stats.totalTasks + 1,
        todo: prev.stats.todo + 1
      }
    } : null)
    setShowTaskForm(false)
    toast({ description: 'Task created successfully!' })
    
    // Celebrate first task
    if (!data?.tasks.length) {
      setCelebrationMessage('Your first task is created! 🎯')
      setCelebrationType('task')
      setShowCelebration(true)
    }
  }

  const handleTaskUpdated = (updatedTask: TaskWithCategory) => {
    const previousTask = data?.tasks.find(t => t.id === updatedTask.id)
    
    setData(prev => prev ? {
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ),
      stats: {
        ...prev.stats,
        completed: updatedTask.status === 'completed' && previousTask?.status !== 'completed' 
          ? prev.stats.completed + 1 : prev.stats.completed,
        inProgress: updatedTask.status === 'in_progress' && previousTask?.status !== 'in_progress'
          ? prev.stats.inProgress + 1 : prev.stats.inProgress,
        todo: updatedTask.status === 'todo' && previousTask?.status !== 'todo'
          ? prev.stats.todo + 1 : prev.stats.todo
      }
    } : null)
    setEditingTask(null)
    toast({ description: 'Task updated successfully!' })
    
    // Celebrate task completion
    if (updatedTask.status === 'completed' && previousTask?.status !== 'completed') {
      setCelebrationMessage(`Task completed: "${updatedTask.title}"! 🎉`)
      setCelebrationType('task')
      setShowCelebration(true)
    }
  }

  const handleTaskDeleted = (deletedTaskId: string) => {
    setData(prev => {
      if (!prev) return null
      const deletedTask = prev.tasks.find(t => t.id === deletedTaskId)
      return {
        ...prev,
        tasks: prev.tasks.filter(task => task.id !== deletedTaskId),
        stats: {
          ...prev.stats,
          totalTasks: prev.stats.totalTasks - 1,
          ...(deletedTask?.status === 'completed' && { completed: prev.stats.completed - 1 }),
          ...(deletedTask?.status === 'in_progress' && { inProgress: prev.stats.inProgress - 1 }),
          ...(deletedTask?.status === 'todo' && { todo: prev.stats.todo - 1 })
        }
      }
    })
    toast({ description: 'Task deleted successfully!' })
  }

  const handleCategoryCreated = (newCategory: Category) => {
    setData(prev => prev ? {
      ...prev,
      categories: [...prev.categories, newCategory]
    } : null)
    toast({ description: 'Category created successfully!' })
  }

  const handleSubjectCreated = (newSubject: Subject) => {
    setSubjects(prev => [...prev, newSubject])
    toast({ description: 'Subject created successfully!' })
  }

  const handleStartTimer = (task: TaskWithCategory) => {
    setTimerTask(task)
    setTimerSubject(null) // clear subject when starting with task
    setShowTimer(true)
  }

  const handleStartTimerWithSubject = (subject: Subject) => {
    setTimerSubject(subject)
    setTimerTask(null) // clear task when starting with subject
    setShowTimer(true)
  }

  const handleTimerSessionComplete = (duration: number, sessionType: string) => {
    // refresh data to show updated timer sessions
    fetchData()
    
    if (sessionType === 'work') {
      toast({ 
        title: 'Great Work!',
        description: `You focused for ${duration} minutes. Time for a break?`
      })
      
      // Celebrate productive work session
      setCelebrationMessage(`${duration} minutes of focused work! Amazing! ⏰`)
      setCelebrationType('timer')
      setShowCelebration(true)
    } else if (sessionType === 'partial_update') {
      // Just refresh data silently for partial updates
      // No toast or celebration for partial updates
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session?.user || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🎯 Apexion Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {!session?.user ? 'Please log in to access your dashboard' : 'Loading your productivity data...'}
            </p>
          </div>
          
          <TroubleshootingGuide 
            onRefresh={() => window.location.reload()}
            isLoggedIn={!!session?.user}
            hasData={!!data}
          />
          
          <div className="text-center mt-8">
            <Button onClick={() => window.location.reload()} className="mr-4">
              Refresh Page
            </Button>
            {!session?.user && (
              <Button variant="outline" onClick={() => window.location.href = '/login'}>
                Go to Login
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const filteredTasks = data.tasks.filter(task => {
    if (activeTab === 'all') return true
    if (activeTab === 'todo') return task.status === 'todo'
    if (activeTab === 'in_progress') return task.status === 'in_progress'
    if (activeTab === 'completed') return task.status === 'completed'
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Apexion</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Welcome back, {session.user.firstName || session.user.name}! Let's get focused.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <NotificationManager />
              
              <ThemeToggle />
              
              <Button
                onClick={() => setShowTaskForm(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/settings'}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => signOut()}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* stats cards */}
        <StatsCards stats={data.stats} />

        <div className="grid lg:grid-cols-4 gap-8 mt-8">
          {/* main content */}
          <div className="lg:col-span-3">
            <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
              <div className="flex items-center justify-between mb-4">
                <TabsList className="grid w-48 grid-cols-2">
                  <TabsTrigger 
                    value="tasks"
                    onClick={() => setActiveMainTab('tasks')}
                  >
                    Tasks
                  </TabsTrigger>
                  <TabsTrigger 
                    value="calendar"
                    onClick={() => setActiveMainTab('calendar')}
                  >
                    Calendar
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowTaskForm(true)}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                  <SimplePrioritizer onPrioritizationComplete={fetchData} />
                </div>
              </div>

              <TabsContent value="tasks">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>My Tasks</CardTitle>
                      <CardDescription>Manage and organize your tasks efficiently</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger 
                          value="all"
                          onClick={() => setActiveTab('all')}
                        >
                          All ({data.stats.totalTasks})
                        </TabsTrigger>
                        <TabsTrigger 
                          value="todo"
                          onClick={() => setActiveTab('todo')}
                        >
                          To Do ({data.stats.todo})
                        </TabsTrigger>
                        <TabsTrigger 
                          value="in_progress"
                          onClick={() => setActiveTab('in_progress')}
                        >
                          In Progress ({data.stats.inProgress})
                        </TabsTrigger>
                        <TabsTrigger 
                          value="completed"
                          onClick={() => setActiveTab('completed')}
                        >
                          Done ({data.stats.completed})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value={activeTab} className="mt-6">
                        <TaskList
                          tasks={filteredTasks}
                          categories={data.categories}
                          onEdit={setEditingTask}
                          onDelete={handleTaskDeleted}
                          onUpdate={handleTaskUpdated}
                          onStartTimer={handleStartTimer}
                        />
                        
                        {/* Help section when no tasks */}
                        {filteredTasks.length === 0 && activeTab === 'all' && (
                          <div className="text-center py-12 space-y-4">
                            <div className="text-gray-400">
                              <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              No tasks yet
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                              Start by creating your first task using the "Add Task" button above. 
                              Organize your work with categories and track your progress!
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center mt-4">
                              <Button onClick={() => setShowTaskForm(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Your First Task
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {filteredTasks.length === 0 && activeTab !== 'all' && (
                          <div className="text-center py-8 space-y-2">
                            <div className="text-gray-400">
                              <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                            </div>
                            <h3 className="text-md font-medium text-gray-900 dark:text-white">
                              No {activeTab.replace('_', ' ')} tasks
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                              {activeTab === 'todo' && 'All your tasks are completed or in progress!'}
                              {activeTab === 'in_progress' && 'No tasks are currently in progress.'}
                              {activeTab === 'completed' && 'No completed tasks yet. Start working on your tasks!'}
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar">
                <CalendarView
                  tasks={data.tasks}
                  onTaskClick={setEditingTask}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* sidebar */}
          <div className="space-y-6">
            <CategoryManager 
              categories={data.categories}
              onCategoryCreated={handleCategoryCreated}
            />

            <SubjectManager 
              subjects={subjects}
              onSubjectCreated={handleSubjectCreated}
              onStartTimer={handleStartTimerWithSubject}
            />
            
            <ProductivityChart />
          </div>
        </div>
      </div>

      {/* task form modal */}
      {(showTaskForm || editingTask) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <TaskForm
              categories={data.categories}
              subjects={subjects}
              editingTask={editingTask}
              onSubmit={editingTask ? handleTaskUpdated : handleTaskCreated}
              onCancel={() => {
                setShowTaskForm(false)
                setEditingTask(null)
              }}
            />
          </div>
        </div>
      )}

      {/* timer modal */}
      {showTimer && (timerTask || timerSubject) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <PomodoroTimer
              task={timerTask}
              subject={timerSubject || timerTask?.subject}
              onSessionComplete={handleTimerSessionComplete}
            />
            <div className="p-4 border-t dark:border-gray-700">
              <Button
                onClick={() => {
                  setShowTimer(false)
                  setTimerTask(null)
                  setTimerSubject(null)
                }}
                variant="outline"
                className="w-full"
              >
                Close Timer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Effects */}
      <CelebrationEffect
        trigger={showCelebration}
        message={celebrationMessage}
        type={celebrationType}
        onComplete={() => setShowCelebration(false)}
      />

    </div>
  )
}
