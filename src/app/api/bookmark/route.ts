import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { questionId, note } = await request.json()

  const { error } = await supabase.from('bookmarks').upsert({
    user_id: user.id,
    question_id: questionId,
    note: note ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const questionId = searchParams.get('questionId')

  if (!questionId) return NextResponse.json({ error: 'questionId required' }, { status: 400 })

  await supabase.from('bookmarks').delete().match({ user_id: user.id, question_id: questionId })
  return NextResponse.json({ success: true })
}
