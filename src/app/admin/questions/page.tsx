'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Edit2, Trash2, Check, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Question } from '@/types'
import toast from 'react-hot-toast'

const PAGE_SIZE = 20

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editQuestion, setEditQuestion] = useState<Question | null>(null)
  const supabase = createClient()

  const [form, setForm] = useState({
    subject: '',
    topic: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    question_text: '',
    choice_a: '', choice_b: '', choice_c: '', choice_d: '',
    correct_answer: 'A',
    explanation: '',
    exam_type: 'both' as 'elementary' | 'secondary' | 'both',
  })

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (search) {
      query = query.ilike('question_text', `%${search}%`)
    }

    const { data, count } = await query
    setQuestions(data as Question[])
    setTotal(count ?? 0)
    setLoading(false)
  }, [supabase, page, search])

  useEffect(() => { loadQuestions() }, [loadQuestions])

  function resetForm() {
    setForm({ subject: '', topic: '', difficulty: 'medium', question_text: '', choice_a: '', choice_b: '', choice_c: '', choice_d: '', correct_answer: 'A', explanation: '', exam_type: 'both' })
    setEditQuestion(null)
  }

  function handleEdit(q: Question) {
    setEditQuestion(q)
    setForm({
      subject: q.subject, topic: q.topic, difficulty: q.difficulty,
      question_text: q.question_text,
      choice_a: q.choices[0]?.text ?? '', choice_b: q.choices[1]?.text ?? '',
      choice_c: q.choices[2]?.text ?? '', choice_d: q.choices[3]?.text ?? '',
      correct_answer: q.correct_answer, explanation: q.explanation ?? '', exam_type: q.exam_type,
    })
    setShowForm(true)
  }

  async function handleSave() {
    const choices = [
      { key: 'A', text: form.choice_a }, { key: 'B', text: form.choice_b },
      { key: 'C', text: form.choice_c }, { key: 'D', text: form.choice_d },
    ]

    if (!form.subject || !form.topic || !form.question_text || !form.choice_a || !form.choice_b || !form.choice_c || !form.choice_d) {
      toast.error('Please fill in all required fields')
      return
    }

    const payload = { subject: form.subject, topic: form.topic, difficulty: form.difficulty, question_text: form.question_text, choices, correct_answer: form.correct_answer, explanation: form.explanation, exam_type: form.exam_type }

    if (editQuestion) {
      await supabase.from('questions').update(payload).eq('id', editQuestion.id)
      toast.success('Question updated!')
    } else {
      await supabase.from('questions').insert(payload)
      toast.success('Question added!')
    }

    setShowForm(false)
    resetForm()
    loadQuestions()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this question? This cannot be undone.')) return
    await supabase.from('questions').update({ is_active: false }).eq('id', id)
    toast.success('Question removed')
    loadQuestions()
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Questions</h1>
          <p className="text-slate-500 text-sm">{total.toLocaleString()} total questions</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Search questions…"
        />
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900">{editQuestion ? 'Edit Question' : 'Add New Question'}</h2>
            <button onClick={() => { setShowForm(false); resetForm() }} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {[
              { label: 'Subject *', key: 'subject', placeholder: 'e.g. Professional Education' },
              { label: 'Topic *', key: 'topic', placeholder: 'e.g. Educational Psychology' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
                <input
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={placeholder}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Exam Type</label>
              <select value={form.exam_type} onChange={(e) => setForm({ ...form, exam_type: e.target.value as any })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="both">Both</option>
                <option value="elementary">Elementary</option>
                <option value="secondary">Secondary</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-700 mb-1">Question Text *</label>
            <textarea
              value={form.question_text}
              onChange={(e) => setForm({ ...form, question_text: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Enter the question here…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {['a', 'b', 'c', 'd'].map((letter) => (
              <div key={letter}>
                <label className="block text-xs font-medium text-slate-700 mb-1">Choice {letter.toUpperCase()} *</label>
                <input
                  value={(form as any)[`choice_${letter}`]}
                  onChange={(e) => setForm({ ...form, [`choice_${letter}`]: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={`Option ${letter.toUpperCase()}`}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Correct Answer *</label>
              <select value={form.correct_answer} onChange={(e) => setForm({ ...form, correct_answer: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {['A', 'B', 'C', 'D'].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-medium text-slate-700 mb-1">Explanation</label>
            <textarea
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Explain why the correct answer is right…"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors">
              <Check className="w-4 h-4" />
              {editQuestion ? 'Update Question' : 'Save Question'}
            </button>
            <button onClick={() => { setShowForm(false); resetForm() }} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Questions table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          {questions.map((q) => (
            <div key={q.id} className="flex items-start gap-4 px-5 py-4 border-b border-slate-50 last:border-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">{q.subject}</span>
                  <span className="text-xs text-slate-400">{q.topic}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' : q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {q.difficulty}
                  </span>
                </div>
                <p className="text-sm text-slate-700 line-clamp-2">{q.question_text}</p>
                <p className="text-xs text-emerald-600 mt-1 font-medium">Answer: {q.correct_answer}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => handleEdit(q)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(q.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="p-2 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="p-2 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
