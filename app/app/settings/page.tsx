

import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SettingsPage from '@/components/settings-page'

export default async function Settings() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  return <SettingsPage />
}
