import { createClient } from '@/lib/supabase/server'
import type { Question, Difficulty, ExamType } from '@/types'

interface FetchQuestionsParams {
  subject?: string
  topic?: string
  difficulty?: Difficulty
  examType?: ExamType
  limit?: number
  excludeIds?: string[]
  userId?: string // for spaced repetition
}

export async function fetchQuestions(params: FetchQuestionsParams = {}): Promise<Question[]> {
  const supabase = await createClient()
  const { subject, topic, difficulty, examType, limit = 20, excludeIds = [] } = params

  let query = supabase
    .from('questions')
    .select('*')
    .eq('is_active', true)

  if (subject) query = query.eq('subject', subject)
  if (topic) query = query.eq('topic', topic)
  if (difficulty) query = query.eq('difficulty', difficulty)
  if (examType && examType !== 'both') {
    query = query.in('exam_type', [examType, 'both'])
  }
  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  query = query.limit(limit * 3) // fetch more for client-side shuffle

  const { data, error } = await query
  if (error) throw error

  // Shuffle and return requested count
  const shuffled = (data as Question[]).sort(() => Math.random() - 0.5)
  return shuffled.slice(0, limit)
}

export async function fetchWeakTopics(userId: string): Promise<{ subject: string; topic: string; accuracy: number }[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('attempts')
    .select('question_id, is_correct, questions(subject, topic)')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  if (error || !data) return []

  const topicStats: Record<string, { total: number; correct: number }> = {}

  for (const attempt of data as any[]) {
    const key = `${attempt.questions?.subject}|||${attempt.questions?.topic}`
    if (!topicStats[key]) topicStats[key] = { total: 0, correct: 0 }
    topicStats[key].total++
    if (attempt.is_correct) topicStats[key].correct++
  }

  return Object.entries(topicStats)
    .map(([key, stats]) => {
      const [subject, topic] = key.split('|||')
      return {
        subject,
        topic,
        total: stats.total,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      }
    })
    .filter((t) => t.total > 3 && t.accuracy < 60) // only show real weak spots
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5)
}

export async function fetchDailyChallenge(date: string) {
  const supabase = await createClient()

  const { data: challenge } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('challenge_date', date)
    .single()

  if (!challenge) return null

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .in('id', challenge.question_ids)

  return { challenge, questions: questions as Question[] }
}
