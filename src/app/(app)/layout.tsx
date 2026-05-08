import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAccessInfo, isRouteAccessible } from '@/lib/subscription'
import AppShell from './AppShell'
import LockedScreen from '@/components/shared/LockedScreen'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const accessInfo = await getAccessInfo(user.id)

  // Determine current pathname for access control
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? '/'

  const canAccess = isRouteAccessible(pathname, accessInfo.status)

  return (
    <AppShell
      accessStatus={accessInfo.status}
      accessEndsAt={accessInfo.endsAt?.toISOString() ?? null}
    >
      {canAccess ? children : <LockedScreen />}
    </AppShell>
  )
}
