import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export type AccessStatus = 'trial' | 'active' | 'expired'

export interface AccessInfo {
  status: AccessStatus
  endsAt: Date | null // trial end or subscription end
}

const TRIAL_HOURS = 24

export const getAccessInfo = cache(async (userId: string): Promise<AccessInfo> => {
  const supabase = await createClient()

  // Check for active subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('ends_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('ends_at', new Date().toISOString())
    .order('ends_at', { ascending: false })
    .limit(1)
    .single()

  if (sub?.ends_at) {
    return { status: 'active', endsAt: new Date(sub.ends_at) }
  }

  // Check trial window
  const { data: profile } = await supabase
    .from('profiles')
    .select('trial_started_at')
    .eq('id', userId)
    .single()

  if (profile?.trial_started_at) {
    const trialEnd = new Date(
      new Date(profile.trial_started_at).getTime() + TRIAL_HOURS * 60 * 60 * 1000
    )
    if (trialEnd > new Date()) {
      return { status: 'trial', endsAt: trialEnd }
    }
  }

  return { status: 'expired', endsAt: null }
})

// Routes that remain accessible even when expired
export const ALWAYS_ACCESSIBLE = ['/analytics', '/settings', '/premium']

export function isRouteAccessible(pathname: string, status: AccessStatus): boolean {
  if (status !== 'expired') return true
  return ALWAYS_ACCESSIBLE.some((route) => pathname === route || pathname.startsWith(route + '/'))
}
