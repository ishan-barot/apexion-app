
import { User, Task, Category, DailyStats, Subject, TimerSession, StudySession, UserPreferences, Achievement } from '@prisma/client'

export type { Category, Subject, TimerSession, StudySession, UserPreferences, Achievement } from '@prisma/client'

export interface SessionUser {
  id: string
  email?: string | null
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  image?: string | null
}

export interface TaskWithCategory extends Task {
  category: Category
  subject?: Subject | null
  timerSessions?: TimerSession[]
}

export interface DashboardData {
  tasks: TaskWithCategory[]
  categories: Category[]
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

export interface CreateTaskData {
  title: string
  description?: string
  priority: number
  categoryId: string
  subjectId?: string
  dueDate?: Date
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: string
}

// for the ai prioritization response
export interface AiPriorityResponse {
  tasks: Array<{
    taskId: string
    suggestedPriority: number
    reasoning: string
  }>
}

// notification types
export interface NotificationPermission {
  permission: NotificationPermission
  supported: boolean
}

// study and timer types
export interface SubjectWithStats extends Subject {
  dailyTime: number // time studied today in minutes
  weeklyTime: number // time studied this week
  studySessions: StudySession[]
}

export interface CreateSubjectData {
  name: string
  color: string
}

export interface TimerState {
  isActive: boolean
  isPaused: boolean
  timeRemaining: number // seconds
  sessionType: 'work' | 'short_break' | 'long_break'
  currentTaskId?: string
  currentSubjectId?: string
  sessionId?: string
}

export interface PomodoroSettings {
  workDuration: number // minutes
  shortBreakDuration: number // minutes
  longBreakDuration: number // minutes
  longBreakInterval: number // sessions before long break
}

export interface StudyDashboardData {
  subjects: SubjectWithStats[]
  totalStudyTime: number
  todayStudyTime: number
  weeklyStudyTime: number
  activeTimerSession?: TimerSession | null
}

// Enhanced interfaces for new features
export interface TaskWithTimeSpent extends TaskWithCategory {
  timeSpent: number // minutes spent on task
}

export interface EditableTimeProps {
  value: number // minutes
  onUpdate: (newValue: number) => void
  readOnly?: boolean
}

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  taskId?: string
  color: string
  type: 'task' | 'due' | 'completed'
}

export interface CommissionSettings {
  rate: number // percentage or flat rate
  type: 'percentage' | 'flat' // commission type
  target: number // daily/weekly target
}

export interface CelebrationConfig {
  enabled: boolean
  soundEnabled: boolean
  animationEnabled: boolean
  achievements: boolean
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  backgroundImage?: string
  customColors?: {
    primary: string
    secondary: string
    accent: string
  }
}

export interface NotificationConfig {
  enabled: boolean
  browser: boolean
  sound: boolean
  types: {
    taskReminder: boolean
    timerComplete: boolean
    achievements: boolean
    dailyGoals: boolean
  }
}

export interface FilterOptions {
  urgency: 'all' | '1' | '2' | '3' | '4'
  subject: 'all' | 'none' | string
  date: 'all' | 'today' | 'tomorrow' | 'this-week' | 'this-month' | 'overdue'
  viewMode: 'list' | 'grid' | 'compact'
  colorCoded: boolean
}
