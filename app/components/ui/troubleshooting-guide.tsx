
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  HelpCircle, 
  ChevronDown, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  User,
  Database,
  Wifi,
  Settings
} from 'lucide-react'

interface TroubleshootingGuideProps {
  onRefresh?: () => void
  isLoggedIn?: boolean
  hasData?: boolean
}

export default function TroubleshootingGuide({ 
  onRefresh, 
  isLoggedIn = false, 
  hasData = false 
}: TroubleshootingGuideProps) {
  const [openSections, setOpenSections] = useState<string[]>([])

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const commonIssues = [
    {
      id: 'login',
      title: 'Cannot create tasks or subjects',
      icon: <User className="h-4 w-4" />,
      status: isLoggedIn ? 'success' : 'warning',
      description: isLoggedIn ? 'You are logged in' : 'You need to be logged in to create tasks',
      solutions: [
        'Make sure you are logged in with a valid account',
        'Try refreshing the page and logging in again',
        'Check if your session has expired and log in again',
        'Use the test account: email: john@doe.com, password: johndoe123'
      ]
    },
    {
      id: 'data',
      title: 'App shows loading or no data',
      icon: <Database className="h-4 w-4" />,
      status: hasData ? 'success' : 'warning',
      description: hasData ? 'Data is loaded' : 'Dashboard data is not loaded',
      solutions: [
        'Refresh the page to reload data',
        'Check browser console for error messages',
        'Make sure you have a stable internet connection',
        'Try creating your first task or category'
      ]
    },
    {
      id: 'calendar',
      title: 'Calendar not working properly',
      icon: <Settings className="h-4 w-4" />,
      status: 'info',
      description: 'Calendar view issues',
      solutions: [
        'Make sure you have tasks with due dates',
        'Try switching between Tasks and Calendar tabs',
        'Check if tasks are visible in the Tasks tab first',
        'Refresh the page to reload calendar data'
      ]
    },
    {
      id: 'network',
      title: 'Network or connection issues',
      icon: <Wifi className="h-4 w-4" />,
      status: 'info',
      description: 'API requests failing',
      solutions: [
        'Check your internet connection',
        'Try refreshing the page',
        'Clear browser cache and cookies',
        'Disable browser extensions temporarily',
        'Try opening the app in an incognito/private window'
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-3 w-3" />
      case 'warning':
      case 'error':
        return <AlertTriangle className="h-3 w-3" />
      default:
        return <HelpCircle className="h-3 w-3" />
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-blue-600" />
          <CardTitle>Troubleshooting Guide</CardTitle>
        </div>
        {onRefresh && (
          <Button onClick={onRefresh} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          If you're experiencing issues with Apexion, here are some common solutions:
        </div>

        {commonIssues.map((issue) => (
          <Collapsible 
            key={issue.id}
            open={openSections.includes(issue.id)}
            onOpenChange={() => toggleSection(issue.id)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {issue.icon}
                  <div className="text-left">
                    <div className="font-medium">{issue.title}</div>
                    <div className="text-sm text-gray-500">{issue.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(issue.status)}>
                    {getStatusIcon(issue.status)}
                    <span className="ml-1 capitalize">{issue.status}</span>
                  </Badge>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="px-4 pb-4">
              <div className="space-y-2">
                <div className="font-medium text-sm mb-2">Solutions:</div>
                {issue.solutions.map((solution, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span>{solution}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="font-medium text-blue-900 mb-2">Quick Test Account</div>
          <div className="text-sm text-blue-800 space-y-1">
            <div><strong>Email:</strong> john@doe.com</div>
            <div><strong>Password:</strong> johndoe123</div>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          If issues persist, try refreshing the page or clearing your browser cache.
        </div>
      </CardContent>
    </Card>
  )
}
