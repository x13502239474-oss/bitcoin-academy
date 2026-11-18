import { useMemo } from 'react'
import { Flame, Target, BookOpen, Clock, ArrowRight, Sparkles, Layers3, Zap } from 'lucide-react'
import { useLearning } from '../store/LearningStore'
import { lessons, modules, lessonById, moduleById, questionById } from '../data'
import { ProgressRing } from '../components/ui/ProgressRing'
import { SectionTitle, Pill, ProgressBar } from '../components/ui/Primitives'
import { dayKey } from '../utils/format'
import type { TabKey } from '../types'

interface Props {
  onNavigate: (tab: TabKey, lessonId?: string) => void
}

export function HomePage({ onNavigate }: Props) {
  const { state, streak, completedCount, wrongAnswers, dueReviews } = useLearning()
  const total = lessons.length
  const progressPct = total ? (completedCount / total) * 100 : 0

  // 今日任务：未完成的前 3 节课
  const todayTasks = useMemo(() => lessons.filter((l) => !state.lessonProgress[l.id]?.completed).slice(0, 3), [state.lessonProgress])
  // 下一节推荐
  const nextLesson = todayTasks[0] ?? lessons[0]
  // 最近学习
  const recentLesson = useMemo(() => {
    const entries = Object.values(state.lessonProgress).filter((p) => p.lastReadAt).sort((a, b) => b.lastReadAt - a.lastReadAt)
    return entries.length ? lessonById.get(entries[0].lessonId) : null
  }, [state.lessonProgress])

  // 已掌握知识点：答对题目所涉及的去重知识点标签数
  const masteredPoints = useMemo(() => {
    const tags = new Set<string>()
    for (const [qid, rec] of Object.entries(state.answers)) {
      if (!rec.correct) continue
      questionById.get(qid)?.tags.forEach((t) => tags.add(t))
    }
    return tags.size
  }, [state.answers])

  const todayCount = state.dailyActivity[dayKey()] ?? 0
  const hour = new Date().getHours()
  const greet = hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 顶部招呼 */}
      <div>
        <div className="flex items-center gap-2 text-btc-400">
          <Sparkles size={15} />
          <span className="text-xs font-medium tracking-wide">{greet}，继续你的比特币之旅</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-mist-100">今天学点什么？</h1>
      </div>

      {/* 进度仪表盘 */}
      <div className="panel relative overflow-hidden p-5">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-btc-500/8 blur-3xl" />
        <div className="relative flex flex-col items-center py-2">
          <ProgressRing value={progressPct} size={200} label={`${completedCount} / ${total} 节已完成`} />
          <div className="mt-4 flex items-center gap-2">
            <Pill tone="btc"><Flame size={12} /> 连续 {streak} 天</Pill>
            <Pill tone="ice">今日 {todayCount} 次活动</Pill>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniStat icon={<BookOpen size={14} />} value={`${completedCount}/${total}`} label="已完成课程" />
          <MiniStat icon={<Target size={14} />} value={String(masteredPoints)} label="已掌握知识点" />
          <MiniStat icon={<Zap size={14} />} value={String(wrongAnswers.length)} label="待复习错题" tone="rose" />
        </div>
      </div>

      {/* 下一节推荐 */}
      {nextLesson && (
        <section>
          <SectionTitle eyebrow="Continue Learning" title="下一节推荐" />
          <button
            onClick={() => onNavigate('courses', nextLesson.id)}
            className="panel group flex w-full items-center gap-3.5 p-4 text-left transition-colors active:border-btc-500/40"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-btc-500/12 text-btc-300">
              <BookOpen size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-medium text-mist-500">模块 {nextLesson.moduleId} · 约 {nextLesson.estMinutes} 分钟</div>
              <div className="truncate text-sm font-semibold text-mist-100">{nextLesson.title}</div>
              <div className="mt-0.5 truncate text-[11px] text-mist-500">{nextLesson.subtitle}</div>
            </div>
            <ArrowRight size={18} className="shrink-0 text-mist-600 group-active:text-btc-400" />
          </button>
        </section>
      )}

      {/* 今日任务 */}
      <section>
        <SectionTitle eyebrow="Today" title="今日学习任务" />
        <div className="space-y-2">
          {todayTasks.map((l) => {
            const m = moduleById.get(l.moduleId)
            return (
              <button
                key={l.id}
                onClick={() => onNavigate('courses', l.id)}
                className="panel-flat flex w-full items-center gap-3 p-3 text-left active:border-btc-500/30"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 font-mono text-[10px] text-mist-400">{l.id}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-mist-200">{l.title}</div>
                  <div className="text-[10px] text-mist-500">{m?.title} · {l.estMinutes} 分钟</div>
                </div>
                <ArrowRight size={14} className="text-mist-600" />
              </button>
            )
          })}
          {todayTasks.length === 0 && (
            <div className="panel-flat p-4 text-center text-xs text-mist-400">全部课程已完成，可以去实验室巩固或复习错题。</div>
          )}
        </div>
      </section>

      {/* 待复习 */}
      {(dueReviews.length > 0 || wrongAnswers.length > 0) && (
        <section>
          <SectionTitle eyebrow="Review" title="待复习内容" />
          <button onClick={() => onNavigate('profile')} className="panel flex w-full items-center gap-3.5 p-4 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-400/10 text-rose-300"><Clock size={20} /></div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-mist-100">巩固薄弱知识点</div>
              <div className="text-[11px] text-mist-500">{dueReviews.length} 项到期复习 · {wrongAnswers.length} 道错题</div>
            </div>
            <ArrowRight size={18} className="text-mist-600" />
          </button>
        </section>
      )}

      {/* 模块进度总览 */}
      <section>
        <SectionTitle eyebrow="Overview" title="十个模块进度" action={<button onClick={() => onNavigate('courses')} className="text-[11px] text-ice-300">查看全部 →</button>} />
        <div className="space-y-2">
          {modules.map((m) => {
            const done = m.lessonIds.filter((id) => state.lessonProgress[id]?.completed).length
            const pct = (done / m.lessonIds.length) * 100
            return (
              <button key={m.id} onClick={() => onNavigate('courses')} className="panel-flat w-full p-3 text-left">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="font-mono text-[10px] text-mist-600">{m.id}</span>
                    <span className="truncate text-xs font-medium text-mist-200">{m.title}</span>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-mist-500">{done}/{m.lessonIds.length}</span>
                </div>
                <ProgressBar value={pct} tone={pct === 100 ? 'btc' : 'ice'} />
              </button>
            )
          })}
        </div>
      </section>

      {recentLesson && (
        <div className="flex items-center gap-2 px-1 text-[10px] text-mist-600">
          <Layers3 size={12} /> 最近学习：{recentLesson.title}
        </div>
      )}
    </div>
  )
}

function MiniStat({ icon, value, label, tone }: { icon: React.ReactNode; value: string; label: string; tone?: 'rose' }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/20 p-2.5 text-center">
      <div className={`mb-1 flex items-center justify-center gap-1 text-[10px] ${tone === 'rose' ? 'text-rose-300' : 'text-mist-500'}`}>{icon}</div>
      <div className="font-mono text-base font-semibold text-mist-100">{value}</div>
      <div className="text-[9px] text-mist-600">{label}</div>
    </div>
  )
}
