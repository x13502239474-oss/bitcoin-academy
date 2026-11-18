import { useMemo, useState } from 'react'
import { Flame, Trophy, Bookmark, NotebookPen, RotateCcw, CheckCircle2, XCircle, Trash2, TrendingUp, Info, Sparkles } from 'lucide-react'
import { useLearning } from '../store/LearningStore'
import { lessons, modules, lessonById, questionById, questions, moduleById } from '../data'
import { SectionTitle, Pill, ProgressBar, EmptyState } from '../components/ui/Primitives'
import { grade, answerToText } from '../utils/grader'
import { calcStreak, dayKey } from '../utils/format'

export function ProfilePage({ onOpenLesson }: { onOpenLesson: (id: string) => void }) {
  const { state, dispatch, streak, completedCount, wrongAnswers, dueReviews } = useLearning()
  const [tab, setTab] = useState<'wrong' | 'notes' | 'fav' | 'mastery'>('wrong')

  const totalHours = useMemo(() => Object.values(state.dailyActivity).reduce((a, b) => a + b, 0), [state.dailyActivity])
  const correctCount = Object.values(state.answers).filter((a) => a.correct).length
  const answeredCount = Object.values(state.answers).length
  const accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0

  // 模块掌握度：按模块统计答题正确率
  const mastery = useMemo(() => modules.map((m) => {
    const qs = questions.filter((q) => q.moduleId === m.id)
    const answered = qs.filter((q) => state.answers[q.id])
    const correct = answered.filter((q) => state.answers[q.id].correct).length
    return { module: m, total: qs.length, answered: answered.length, pct: answered.length ? (correct / answered.length) * 100 : 0 }
  }), [state.answers])

  const favLessons = state.favorites.map((id) => lessonById.get(id)).filter(Boolean)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 学习概览 */}
      <div className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <Trophy size={17} className="text-btc-400" />
          <span className="text-sm font-semibold text-mist-100">学习概览</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <BigStat value={String(completedCount)} label="完成课程" sub={`/ ${lessons.length} 节`} />
          <BigStat value={String(streak)} label="连续学习" sub="天" icon={<Flame size={12} />} />
          <BigStat value={`${accuracy}%`} label="答题正确率" sub={`${answeredCount} 题`} />
          <BigStat value={String(totalHours)} label="学习活动" sub="次" />
        </div>
      </div>

      {/* Tab */}
      <div className="grid grid-cols-4 gap-1.5">
        {([
          { k: 'wrong', label: '错题本', icon: <RotateCcw size={14} />, badge: wrongAnswers.length },
          { k: 'notes', label: '笔记', icon: <NotebookPen size={14} />, badge: state.notes.length },
          { k: 'fav', label: '收藏', icon: <Bookmark size={14} />, badge: state.favorites.length },
          { k: 'mastery', label: '掌握度', icon: <TrendingUp size={14} />, badge: 0 },
        ] as const).map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`relative flex flex-col items-center gap-1 rounded-xl border py-2.5 text-[11px] ${tab === t.k ? 'border-btc-500/40 bg-btc-500/10 text-btc-300' : 'border-white/10 text-mist-400'}`}>
            {t.icon}
            {t.label}
            {t.badge > 0 && <span className="absolute right-1.5 top-1 rounded-full bg-rose-500/80 px-1 text-[8px] text-white">{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* 错题本 */}
      {tab === 'wrong' && (
        <section>
          {dueReviews.length > 0 && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/6 p-3 text-[11px] leading-relaxed text-amber-200/85">
              <Sparkles size={14} className="mt-0.5 shrink-0" />
              <span>有 {dueReviews.length} 个知识点到达间隔复习时间。间隔复习会在遗忘临界点提醒你，效果优于临时抱佛脚。</span>
            </div>
          )}
          {wrongAnswers.length === 0 ? (
            <EmptyState icon={<CheckCircle2 size={28} />} title="错题本是空的" text="目前没有待复习的错题。继续学习，遇到错题会自动收进这里。" />
          ) : (
            <div className="space-y-3">
              {wrongAnswers.map((rec) => {
                const q = questionById.get(rec.questionId)
                if (!q) return null
                const result = grade(rec.userAnswer, q)
                return (
                  <div key={rec.questionId} className="panel p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <XCircle size={14} className="shrink-0 text-rose-400" />
                      <span className="text-[10px] text-mist-500">模块 {q.moduleId} · {typeLabel(q.type)}</span>
                      <button
                        onClick={() => dispatch({ type: 'RESOLVE_WRONG', questionId: q.id })}
                        className="ml-auto flex items-center gap-1 rounded-lg border border-emerald-400/30 px-2 py-1 text-[10px] text-emerald-300"
                      >
                        <CheckCircle2 size={11} /> 已掌握，移出
                      </button>
                    </div>
                    <div className="text-xs font-medium leading-relaxed text-mist-200">{q.stem}</div>
                    <div className="mt-2 rounded-lg border border-rose-400/20 bg-rose-400/5 p-2.5 text-[11px] text-mist-400">
                      <span className="text-rose-300">你的答案：</span>{rec.userAnswer || '（未作答）'}
                    </div>
                    <div className="mt-2 rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-2.5 text-[11px] leading-relaxed text-mist-300">
                      <div className="mb-1 font-semibold text-emerald-300">正确答案与解析</div>
                      {q.options && (
                        <div className="mb-1.5 text-emerald-200/80">
                          正确选项：{(Array.isArray(q.answer) ? q.answer : [q.answer ?? 0]).map((i) => q.options?.[i]).join('、')}
                        </div>
                      )}
                      {q.explanation}
                      {result.missing && result.missing.length > 0 && (
                        <div className="mt-1.5 text-amber-300/80">你未覆盖的要点：{result.missing.join('、')}</div>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">{q.tags.map((tag) => <Pill key={tag}>{tag}</Pill>)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* 笔记 */}
      {tab === 'notes' && (
        <section>
          {state.notes.length === 0 ? (
            <EmptyState icon={<NotebookPen size={28} />} title="还没有笔记" text="在课程页点击笔记图标，记录你的理解与疑问。" />
          ) : (
            <div className="space-y-2">
              {state.notes.map((n) => {
                const l = lessonById.get(n.lessonId)
                return (
                  <div key={n.id} className="panel-flat p-3.5">
                    <div className="mb-1.5 flex items-center gap-2">
                      <button onClick={() => l && onOpenLesson(l.id)} className="truncate text-[11px] font-medium text-ice-300">{l?.title ?? n.lessonId}</button>
                      <span className="ml-auto shrink-0 text-[10px] text-mist-600">{new Date(n.at).toLocaleDateString('zh-CN')}</span>
                      <button onClick={() => dispatch({ type: 'DELETE_NOTE', id: n.id })} className="text-mist-600"><Trash2 size={13} /></button>
                    </div>
                    <div className="text-xs leading-relaxed text-mist-300">{n.text}</div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* 收藏 */}
      {tab === 'fav' && (
        <section>
          {favLessons.length === 0 ? (
            <EmptyState icon={<Bookmark size={28} />} title="暂无收藏" text="在课程页点击书签图标收藏课程。" />
          ) : (
            <div className="space-y-2">
              {favLessons.map((l) => l && (
                <button key={l.id} onClick={() => onOpenLesson(l.id)} className="panel-flat flex w-full items-center gap-3 p-3.5 text-left">
                  <Bookmark size={15} className="shrink-0 text-btc-400" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium text-mist-200">{l.title}</div>
                    <div className="text-[10px] text-mist-500">模块 {l.moduleId}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 掌握度 */}
      {tab === 'mastery' && (
        <section>
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-white/8 bg-white/3 p-3 text-[11px] leading-relaxed text-mist-400">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>掌握度基于你在各模块测试中的表现。数值越高表示该模块题目答对率越高；未答题的模块不参与统计。</span>
          </div>
          <div className="space-y-3">
            {mastery.map((m) => (
              <div key={m.module.id} className="panel-flat p-3.5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-medium text-mist-200">{m.module.id}. {m.module.title}</span>
                  <span className="shrink-0 font-mono text-[11px] text-mist-400">{m.answered ? `${Math.round(m.pct)}%` : '未测'}</span>
                </div>
                <ProgressBar value={m.pct} tone={m.pct >= 80 ? 'btc' : 'ice'} />
                <div className="mt-1.5 text-[10px] text-mist-600">已答 {m.answered} / {m.total} 题</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 学习历史 / 数据说明 */}
      <section className="rounded-xl border border-white/8 bg-white/3 p-3.5">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-mist-300"><Info size={14} /> 关于你的学习数据</div>
        <p className="text-[11px] leading-relaxed text-mist-500">
          所有进度、笔记、错题都保存在这台设备的浏览器本地存储中，不会上传，刷新或关闭浏览器都不会丢失。清除浏览器数据会一并清除学习记录。
        </p>
        <button
          onClick={() => { if (confirm('确定清空所有学习记录吗？此操作不可撤销。')) dispatch({ type: 'RESET' }) }}
          className="mt-3 rounded-lg border border-rose-400/30 px-3 py-1.5 text-[11px] text-rose-300"
        >
          清空学习记录
        </button>
      </section>
    </div>
  )
}

function BigStat({ value, label, sub, icon }: { value: string; label: string; sub: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/20 p-3">
      <div className="mb-1 flex items-center gap-1 text-[10px] text-mist-500">{icon}{label}</div>
      <div className="font-mono text-xl font-bold text-mist-100">{value}<span className="ml-1 text-[10px] font-normal text-mist-500">{sub}</span></div>
    </div>
  )
}

function typeLabel(t: string): string {
  return { single: '单选', multiple: '多选', boolean: '判断', concept: '概念辨析', scenario: '场景分析' }[t] ?? t
}
