import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!existing) {
    await supabase.from('streaks').insert({
      user_id: user.id,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
    })
    return NextResponse.json({ streak: 1 })
  }

  const lastDate = existing.last_activity_date
  if (lastDate === today) {
    return NextResponse.json({ streak: existing.current_streak })
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const newStreak = lastDate === yesterdayStr ? existing.current_streak + 1 : 1
  const longestStreak = Math.max(newStreak, existing.longest_streak ?? 1)

  await supabase
    .from('streaks')
    .update({ current_streak: newStreak, longest_streak: longestStreak, last_activity_date: today })
    .eq('user_id', user.id)

  return NextResponse.json({ streak: newStreak })
}
