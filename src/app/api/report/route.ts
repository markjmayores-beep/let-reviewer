import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { questionId, reason, details } = await request.json()

  await supabase.from('question_reports').insert({
    user_id: user.id,
    question_id: questionId,
    reason,
    details,
  })

  // Increment reported count via raw SQL increment
  try {
    const { data: current } = await supabase
      .from('questions')
      .select('reported_count')
      .eq('id', questionId)
      .single()
    if (current) {
      await supabase
        .from('questions')
        .update({ reported_count: (current.reported_count ?? 0) + 1 })
        .eq('id', questionId)
    }
  } catch {
    // Non-critical — ignore if question not found
  }

  return NextResponse.json({ success: true })
}
