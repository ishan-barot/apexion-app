
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Dashboard from '@/components/dashboard'
import WelcomePage from '@/components/welcome-page'

export default async function HomePage() {
  const session = await getSession()

  if (session?.user) {
    return <Dashboard />
  }

  return <WelcomePage />
}
