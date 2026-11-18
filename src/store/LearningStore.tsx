import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type { LearningState, LessonProgress, AnswerRecord, Note, ReviewItem } from '../types'
import { dayKey, calcStreak } from '../utils/format'

const STORAGE_KEY = 'bitcoin-academy:v1'

function initialState(): LearningState {
  return {
    version: 1,
    lessonProgress: {},
    answers: {},
    notes: [],
    favorites: [],
    reviews: {},
    dailyActivity: {},
    labResults: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

function load(): LearningState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw)
    // 浅合并，向前兼容新增字段
    return { ...initialState(), ...parsed, version: 1 }
  } catch {
    return initialState()
  }
}

type Action =
  | { type: 'READ_LESSON'; lessonId: string; block: number }
  | { type: 'COMPLETE_LESSON'; lessonId: string }
  | { type: 'ANSWER'; record: AnswerRecord; tagReviews?: string[] }
  | { type: 'ADD_NOTE'; lessonId: string; text: string }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'TOGGLE_FAVORITE'; id: string }
  | { type: 'RESOLVE_WRONG'; questionId: string }
  | { type: 'LAB_RESULT'; labId: string }
  | { type: 'REVIEW_DONE'; key: string }
  | { type: 'RESET' }

function reducer(state: LearningState, action: Action): LearningState {
  const now = Date.now()
  const base = { ...state, updatedAt: now }
  const touchActivity = (s: LearningState): LearningState => {
    const k = dayKey(now)
    return { ...s, dailyActivity: { ...s.dailyActivity, [k]: (s.dailyActivity[k] ?? 0) + 1 } }
  }

  switch (action.type) {
    case 'READ_LESSON': {
      const prev = state.lessonProgress[action.lessonId]
      const next: LessonProgress = {
        lessonId: action.lessonId,
        completed: prev?.completed ?? false,
        readBlock: Math.max(prev?.readBlock ?? 0, action.block),
        lastReadAt: now,
      }
      return { ...base, lessonProgress: { ...state.lessonProgress, [action.lessonId]: next } }
    }
    case 'COMPLETE_LESSON': {
      const prev = state.lessonProgress[action.lessonId]
      const next: LessonProgress = {
        lessonId: action.lessonId,
        completed: true,
        readBlock: prev?.readBlock ?? 0,
        lastReadAt: now,
      }
      return touchActivity({ ...base, lessonProgress: { ...state.lessonProgress, [action.lessonId]: next } })
    }
    case 'ANSWER': {
      const answers = { ...state.answers, [action.record.questionId]: action.record }
      // 间隔复习：答错则 1 天后复习；答对则按 streak 递增间隔
      const reviews = { ...state.reviews }
      const tags = action.tagReviews ?? []
      for (const tag of tags) {
        const key = `tag:${tag}`
        const prev = reviews[key]
        let interval = 1
        let streak = 0
        if (prev) {
          streak = action.record.correct ? prev.streak + 1 : 0
          interval = action.record.correct ? Math.max(1, prev.interval * 2) : 1
        } else if (action.record.correct) {
          streak = 1
          interval = 3
        }
        reviews[key] = {
          key,
          kind: 'tag',
          dueAt: now + interval * 86400000,
          interval,
          streak,
        }
      }
      return touchActivity({ ...base, answers, reviews })
    }
    case 'ADD_NOTE': {
      const note: Note = { id: `n_${now}_${Math.random().toString(36).slice(2, 6)}`, lessonId: action.lessonId, text: action.text, at: now }
      return { ...base, notes: [note, ...state.notes] }
    }
    case 'DELETE_NOTE':
      return { ...base, notes: state.notes.filter((n) => n.id !== action.id) }
    case 'TOGGLE_FAVORITE': {
      const has = state.favorites.includes(action.id)
      return { ...base, favorites: has ? state.favorites.filter((x) => x !== action.id) : [...state.favorites, action.id] }
    }
    case 'RESOLVE_WRONG': {
      const rec = state.answers[action.questionId]
      if (!rec) return base
      return { ...base, answers: { ...state.answers, [action.questionId]: { ...rec, resolved: true } } }
    }
    case 'LAB_RESULT':
      return touchActivity({ ...base, labResults: { ...state.labResults, [action.labId]: { at: now } } })
    case 'REVIEW_DONE': {
      const prev = state.reviews[action.key]
      if (!prev) return base
      const interval = Math.max(1, prev.interval * 2)
      return touchActivity({
        ...base,
        reviews: { ...state.reviews, [action.key]: { ...prev, dueAt: now + interval * 86400000, interval, streak: prev.streak + 1 } },
      })
    }
    case 'RESET':
      return initialState()
    default:
      return state
  }
}

interface StoreValue {
  state: LearningState
  dispatch: React.Dispatch<Action>
  streak: number
  completedCount: number
  wrongAnswers: AnswerRecord[]
  dueReviews: ReviewItem[]
}

const LearningContext = createContext<StoreValue | null>(null)

export function LearningProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // 存储不可用（隐私模式）时静默降级
    }
  }, [state])

  const streak = calcStreak(state.dailyActivity)
  const completedCount = Object.values(state.lessonProgress).filter((p) => p.completed).length
  const wrongAnswers = Object.values(state.answers).filter((a) => !a.correct && !a.resolved)
  const now = Date.now()
  const dueReviews = Object.values(state.reviews).filter((r) => r.dueAt <= now)

  return (
    <LearningContext.Provider value={{ state, dispatch, streak, completedCount, wrongAnswers, dueReviews }}>
      {children}
    </LearningContext.Provider>
  )
}

export function useLearning(): StoreValue {
  const ctx = useContext(LearningContext)
  if (!ctx) throw new Error('useLearning must be used within LearningProvider')
  return ctx
}
