import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, CheckCircle2, Bookmark, BookmarkCheck, NotebookPen, Target, HelpCircle, Lightbulb, FlaskConical, ExternalLink, X, Plus, Trash2, ChevronRight } from 'lucide-react'
import { useLearning } from '../store/LearningStore'
import { lessonById, questionById, moduleById } from '../data'
import { ContentRenderer } from '../components/ui/ContentRenderer'
import { Diagram } from '../components/viz/Diagram'
import { Pill } from '../components/ui/Primitives'
import { grade, answerToText } from '../utils/grader'
import { LAB_LIST } from '../components/labs/registry'
import type { Question } from '../types'

export function LessonPage({ lessonId, onBack, onNavigateLab, onNavigate }: {
  lessonId: string
  onBack: () => void
  onNavigateLab: (id: string) => void
  onNavigate: (tab: 'courses' | 'profile') => void
}) {
  const lesson = lessonById.get(lessonId)
  const { state, dispatch } = useLearning()
  const [noteText, setNoteText] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'instant' }) }, [lessonId])

  if (!lesson) {
    return <div className="panel p-6 text-center text-sm text-mist-400">课程不存在。<button onClick={onBack} className="ml-2 text-btc-400">返回</button></div>
  }

  const m = moduleById.get(lesson.moduleId)
  const progress = state.lessonProgress[lesson.id]
  const completed = progress?.completed ?? false
  const faved = state.favorites.includes(lesson.id)
  const notes = state.notes.filter((n) => n.lessonId === lesson.id)
  const questions = lesson.quizIds.map((id) => questionById.get(id)).filter(Boolean) as Question[]

  return (
    <div ref={topRef} className="space-y-5 animate-fade-in">
      {/* 顶部导航 */}
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-mist-300"><ArrowLeft size={14} /> 返回课程</button>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', id: lesson.id })} className={`flex h-9 w-9 items-center justify-center rounded-lg border ${faved ? 'border-btc-500/40 bg-btc-500/10 text-btc-300' : 'border-white/10 text-mist-500'}`} aria-label="收藏">
            {faved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
          <button onClick={() => setShowNotes((s) => !s)} className={`flex h-9 w-9 items-center justify-center rounded-lg border ${showNotes ? 'border-ice-400/40 bg-ice-400/10 text-ice-300' : 'border-white/10 text-mist-500'}`} aria-label="笔记">
            <NotebookPen size={16} />
          </button>
        </div>
      </div>

      {/* 课程头 */}
      <div className="panel p-5">
        <div className="mb-2 flex items-center gap-2">
          <Pill tone="btc">模块 {lesson.moduleId} · 第 {lesson.order} 课</Pill>
          <span className="text-[11px] text-mist-500">约 {lesson.estMinutes} 分钟</span>
        </div>
        <h1 className="text-2xl font-bold text-mist-100">{lesson.title}</h1>
        {lesson.subtitle && <p className="mt-1 text-sm text-mist-400">{lesson.subtitle}</p>}
        <div className="mt-2 text-[11px] text-mist-600">{m?.title}</div>
      </div>

      {/* 01 本章导读：研究的问题 + 学习目的 + 知识背景 */}
      <Section icon={<BookOpenIcon />} n="01" title="本章导读">
        {lesson.intro && (
          <div className="mb-3 space-y-2 text-sm leading-relaxed text-mist-300">
            {lesson.intro.split('\n').filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
        <div className="rounded-xl border border-btc-500/25 bg-btc-500/6 p-3.5">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-btc-300"><HelpCircle size={12} /> 本节要回答的核心问题</div>
          <div className="text-sm leading-relaxed text-btc-200">{lesson.coreQuestion}</div>
        </div>
        <div className="mt-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-mist-400"><Target size={12} /> 学完你能</div>
          <ul className="space-y-1.5">
            {lesson.objectives.map((o, i) => (
              <li key={i} className="flex gap-2 text-xs text-mist-300"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />{o}</li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 02 核心概念 */}
      <Section icon={<KeyIcon />} n="02" title="核心概念">
        {lesson.terms.length > 0 ? (
          <div className="space-y-2.5">
            {lesson.terms.map((t, i) => (
              <div key={i} className="rounded-lg border border-white/8 bg-black/20 p-3">
                <div className="text-sm">
                  <span className="font-semibold text-mist-100">{t.zh}</span>
                  <span className="ml-1.5 font-mono text-[11px] text-ice-300">{t.en}</span>
                </div>
                {t.note && <div className="mt-1 text-[11px] leading-relaxed text-mist-400">{t.note}</div>}
              </div>
            ))}
          </div>
        ) : <div className="text-[11px] text-mist-600">本课无新增术语。</div>}
      </Section>

      {/* 03 技术原理 */}
      <Section icon={<CpuIcon />} n="03" title="技术原理">
        <ContentRenderer blocks={lesson.content} />
      </Section>

      {/* 04 原理图解 / 运行流程 */}
      {(lesson.diagrams?.length || lesson.diagram) && (
        <Section icon={<DiagramIcon />} n="04" title="原理图解与运行流程">
          <div className="space-y-3">
            {(lesson.diagrams ?? (lesson.diagram ? [lesson.diagram] : [])).map((d, i) => (
              <Diagram key={i} spec={d} />
            ))}
          </div>
        </Section>
      )}

      {/* 05 实例演示 */}
      {lesson.workedExample && (
        <Section icon={<CalculatorIcon />} n="05" title="实例演示">
          <WorkedExampleBlock example={lesson.workedExample} />
        </Section>
      )}

      {/* 06 互动演示 */}
      {(lesson.labId || LAB_LIST.some((l) => l.moduleId === lesson.moduleId)) && (
        <Section icon={<FlaskConical size={15} />} n="06" title="互动演示">
          <LabLink lesson={lesson} onNavigateLab={onNavigateLab} />
        </Section>
      )}

      {/* 07 技术分析 */}
      {lesson.analysis && lesson.analysis.length > 0 && (
        <Section icon={<ScaleIcon />} n="07" title="技术分析">
          <AnalysisBlock points={lesson.analysis} />
        </Section>
      )}

      {/* 08 常见误区 */}
      {lesson.misconceptions && lesson.misconceptions.length > 0 && (
        <Section icon={<AlertIcon />} n="08" title="常见误区">
          <div className="space-y-2.5">
            {lesson.misconceptions.map((m, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-white/10">
                <div className="flex gap-2 bg-rose-400/8 px-3 py-2 text-xs leading-relaxed text-rose-200">
                  <X size={14} className="mt-0.5 shrink-0" /><span>{m.wrong}</span>
                </div>
                <div className="flex gap-2 bg-emerald-400/8 px-3 py-2 text-xs leading-relaxed text-emerald-200">
                  <Check size={14} className="mt-0.5 shrink-0" /><span>{m.right}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 笔记面板 */}
      {showNotes && (
        <div className="panel p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-mist-100"><NotebookPen size={15} className="text-ice-300" /> 我的笔记</div>
          <div className="flex gap-2">
            <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="记下你的理解或疑问…" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-mist-100 outline-none focus:border-ice-400/50" />
            <button onClick={() => { if (noteText.trim()) { dispatch({ type: 'ADD_NOTE', lessonId: lesson.id, text: noteText.trim() }); setNoteText('') } }} className="rounded-lg bg-ice-500/20 px-3 text-ice-300"><Plus size={16} /></button>
          </div>
          <div className="mt-3 space-y-2">
            {notes.map((n) => (
              <div key={n.id} className="flex items-start gap-2 rounded-lg border border-white/8 bg-white/3 p-2.5 text-xs text-mist-300">
                <span className="min-w-0 flex-1">{n.text}</span>
                <button onClick={() => dispatch({ type: 'DELETE_NOTE', id: n.id })} className="text-mist-600 active:text-rose-400"><Trash2 size={13} /></button>
              </div>
            ))}
            {notes.length === 0 && <div className="text-[11px] text-mist-600">还没有笔记。</div>}
          </div>
        </div>
      )}

      {/* 09 章节总结 */}
      <Section icon={<Lightbulb size={15} />} n="09" title="章节总结">
        <div className="space-y-2">
          {lesson.keyPoints.map((k, i) => (
            <div key={i} className="flex gap-2.5 rounded-lg border border-white/8 bg-white/3 p-3 text-xs leading-relaxed text-mist-300">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-btc-500/15 font-mono text-[10px] text-btc-300">{i + 1}</span>
              {k}
            </div>
          ))}
        </div>
      </Section>

      {/* 10 课后练习与解析 */}
      <Section icon={<HelpCircle size={15} />} n="10" title="课后练习与答案解析">
        <QuizBlock questions={questions} lessonId={lesson.id} onShowWrong={() => onNavigate('profile')} />
      </Section>

      {/* 11 延伸阅读 */}
      <Section icon={<ExternalLink size={15} />} n="11" title="延伸阅读">
        <div className="space-y-2">
          {lesson.furtherReading.length === 0 && <div className="text-[11px] text-mist-600">本课暂无延伸阅读。</div>}
          {lesson.furtherReading.map((r, i) => (
            <div key={i} className="rounded-lg border border-white/8 bg-white/3 p-3">
              {r.url ? (
                <a href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-medium text-ice-300">{r.title} <ExternalLink size={12} /></a>
              ) : <div className="text-xs font-medium text-mist-200">{r.title}</div>}
              {r.note && <div className="mt-1 text-[11px] leading-relaxed text-mist-500">{r.note}</div>}
            </div>
          ))}
        </div>
      </Section>

      {/* 资料日期 */}
      {lesson.asOf && <div className="px-1 text-[10px] text-mist-600">资料标注：{lesson.asOf}</div>}

      {/* 完成按钮 */}
      <button
        onClick={() => { if (!completed) dispatch({ type: 'COMPLETE_LESSON', lessonId: lesson.id }) }}
        disabled={completed}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold ${completed ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'bg-gradient-to-r from-btc-600 to-btc-500 text-white shadow-glow-btc'}`}
      >
        {completed ? <><CheckCircle2 size={17} /> 已完成本课</> : <><Check size={17} /> 标记本课学完</>}
      </button>
    </div>
  )
}

function Section({ icon, n, title, children }: { icon: React.ReactNode; n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="panel p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-btc-400">{icon}</span>
        <h2 className="text-sm font-semibold text-mist-100">{title}</h2>
        <span className="ml-auto font-mono text-[10px] text-mist-600">{n}</span>
      </div>
      {children}
    </section>
  )
}

function BookOpenIcon() { return <BookmarksIconWrap><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></BookmarksIconWrap> }
function BookmarksIconWrap({ children }: { children: React.ReactNode }) { return <>{children}</> }
function DiagramIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="6" height="6"/><rect x="15" y="15" width="6" height="6"/><path d="M9 6h6a3 3 0 0 1 3 3v6"/></svg> }
function KeyIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3 21 2"/><path d="M17 6l3 3"/><path d="M14 9l3 3"/></svg> }
function CpuIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg> }
function CalculatorIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h4"/></svg> }
function ScaleIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M7 21h10"/><path d="M5 7h14"/><path d="M5 7 2 14h6L5 7zM19 7l-3 7h6l-3-7z"/></svg> }
function AlertIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg> }

/** 实例演示：场景 → 分步推演 → 数据表/代码 → 结论 */
function WorkedExampleBlock({ example }: { example: NonNullable<ReturnType<typeof lessonById.get>>['workedExample'] }) {
  if (!example) return null
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-ice-400/25 bg-ice-400/6 p-3.5">
        <div className="mb-1 text-xs font-semibold text-ice-200">{example.title}</div>
        <div className="text-xs leading-relaxed text-mist-300">{example.setup}</div>
      </div>
      <ol className="space-y-2">
        {example.steps.map((s, i) => (
          <li key={i} className="flex gap-2.5 rounded-lg border border-white/8 bg-black/20 p-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ice-400/15 font-mono text-[10px] text-ice-300">{i + 1}</span>
            <div className="min-w-0">
              <div className="text-xs font-medium text-mist-100">{s.label}</div>
              <div className="mt-1 break-words font-mono text-[11px] leading-relaxed text-mist-400">{s.detail}</div>
            </div>
          </li>
        ))}
      </ol>
      {example.table && (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[420px] text-left text-xs">
            <thead className="bg-white/5 text-mist-300">
              <tr>{example.table.headers.map((h, j) => <th key={j} className="whitespace-nowrap px-3 py-2 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {example.table.rows.map((row, r) => (
                <tr key={r} className="border-t border-white/8">
                  {row.map((cell, c) => <td key={c} className="px-3 py-2 align-top font-mono text-[11px] text-mist-300">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {example.code && (
        <div>
          <pre className="code-block overflow-x-auto p-3.5 text-[11px] leading-relaxed"><code>{example.code.text}</code></pre>
          {example.code.caption && <div className="mt-1 text-[10px] text-mist-500">{example.code.caption}</div>}
        </div>
      )}
      <div className="rounded-lg border border-btc-500/25 bg-btc-500/6 p-3 text-xs leading-relaxed text-btc-200">
        <span className="font-semibold">结论　</span>{example.conclusion}
      </div>
    </div>
  )
}

/** 技术分析：优势 / 局限 / 安全边界 */
function AnalysisBlock({ points }: { points: NonNullable<ReturnType<typeof lessonById.get>>['analysis'] }) {
  const tone = {
    pro: { cls: 'border-emerald-400/25 bg-emerald-400/6', label: 'text-emerald-300', tag: '优势' },
    con: { cls: 'border-amber-400/25 bg-amber-400/6', label: 'text-amber-300', tag: '局限' },
    risk: { cls: 'border-rose-400/25 bg-rose-400/6', label: 'text-rose-300', tag: '安全边界' },
  } as const
  return (
    <div className="space-y-2">
      {(points ?? []).map((p, i) => {
        const t = tone[p.tone]
        return (
          <div key={i} className={`rounded-lg border p-3 ${t.cls}`}>
            <div className={`mb-1 flex items-center gap-2 text-xs font-semibold ${t.label}`}>
              <span className="rounded bg-black/25 px-1.5 py-0.5 text-[10px]">{t.tag}</span>{p.label}
            </div>
            <div className="text-[11px] leading-relaxed text-mist-300">{p.text}</div>
          </div>
        )
      })}
    </div>
  )
}

function LabLink({ lesson, onNavigateLab }: { lesson: NonNullable<ReturnType<typeof lessonById.get>>; onNavigateLab: (id: string) => void }) {
  const target = lesson.labId ?? LAB_LIST.find((l) => l.moduleId === lesson.moduleId)?.id
  const lab = LAB_LIST.find((l) => l.id === target)
  if (!lab) return <div className="text-[11px] text-mist-600">本课暂无关联实验。</div>
  return (
    <button onClick={() => onNavigateLab(lab.id)} className="flex w-full items-center gap-3 rounded-xl border border-ice-400/25 bg-ice-400/6 p-3.5 text-left active:border-ice-400/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ice-400/12 text-ice-300"><FlaskConical size={19} /></div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold text-ice-200">打开「{lab.title}」</div>
        <div className="mt-0.5 text-[11px] text-mist-500">{lab.desc}</div>
      </div>
      <ChevronRight size={17} className="text-ice-400" />
    </button>
  )
}

function QuizBlock({ questions, lessonId, onShowWrong }: { questions: Question[]; lessonId: string; onShowWrong: () => void }) {
  const { state, dispatch } = useLearning()
  const [answers, setAnswers] = useState<Record<string, string | number | number[]>>({})
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})
  const [textInputs, setTextInputs] = useState<Record<string, string>>({})

  if (questions.length === 0) return <div className="text-[11px] text-mist-600">本课暂无随堂测试。</div>

  const toggleMulti = (qid: string, idx: number) => {
    const cur = (answers[qid] as number[]) ?? []
    setAnswers((a) => ({ ...a, [qid]: cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx] }))
  }

  const submit = (q: Question) => {
    const ans = q.type === 'concept' || q.type === 'scenario' ? (textInputs[q.id] ?? '') : (answers[q.id] ?? '')
    const result = grade(ans, q)
    dispatch({ type: 'ANSWER', record: { questionId: q.id, correct: result.correct, userAnswer: answerToText(ans, q), at: Date.now(), resolved: false }, tagReviews: q.tags })
    setAnswers((a) => ({ ...a, [q.id]: ans }))
    setSubmitted((s) => ({ ...s, [q.id]: true }))
  }

  return (
    <div className="space-y-4">
      {questions.map((q, i) => {
        const isDone = submitted[q.id] || !!state.answers[q.id]
        const record = state.answers[q.id]
        // 要点型题刷新后用存档文本重算命中情况，用于展示未覆盖要点；对错判定始终以存档 correct 为准
        const keywordResult = isDone && record && (q.type === 'concept' || q.type === 'scenario')
          ? grade(record.userAnswer, q) : null
        return (
          <div key={q.id} className="rounded-xl border border-white/10 bg-black/20 p-3.5">
            <div className="mb-2 flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-btc-500/12 font-mono text-[10px] text-btc-300">{i + 1}</span>
              <div className="text-xs font-medium leading-relaxed text-mist-200">{q.stem}</div>
              <span className="ml-auto shrink-0 text-[9px] text-mist-600">{typeLabel(q.type)}</span>
            </div>

            {/* 选择题选项 */}
            {(q.type === 'single' || q.type === 'multiple' || q.type === 'boolean') && q.options && (
              <div className="space-y-1.5 pl-8">
                {q.options.map((opt, oi) => {
                  const selected = q.type === 'multiple' ? ((answers[q.id] as number[]) ?? []).includes(oi) : answers[q.id] === oi
                  const isCorrectOpt = q.type === 'boolean' ? (q.answer === 0 ? oi === 0 : oi === 1) : (Array.isArray(q.answer) ? q.answer.includes(oi) : q.answer === oi)
                  const showCorrect = isDone && isCorrectOpt
                  const showWrongPick = isDone && selected && !isCorrectOpt
                  return (
                    <button
                      key={oi}
                      onClick={() => !isDone && (q.type === 'multiple' ? toggleMulti(q.id, oi) : setAnswers((a) => ({ ...a, [q.id]: oi })))}
                      className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                        showCorrect ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                          : showWrongPick ? 'border-rose-400/40 bg-rose-400/10 text-rose-200'
                            : selected ? 'border-btc-500/40 bg-btc-500/10 text-btc-200'
                              : 'border-white/8 text-mist-400'
                      }`}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/15 font-mono text-[10px]">{q.type === 'boolean' ? (oi === 0 ? '√' : '×') : String.fromCharCode(65 + oi)}</span>
                      {opt}
                      {showCorrect && <Check size={14} className="ml-auto shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}

            {/* 简答/场景题 */}
            {(q.type === 'concept' || q.type === 'scenario') && (
              <div className="pl-8">
                <textarea
                  value={textInputs[q.id] ?? (isDone && record ? record.userAnswer : '')}
                  onChange={(e) => setTextInputs((t) => ({ ...t, [q.id]: e.target.value }))}
                  disabled={isDone}
                  rows={4}
                  placeholder="写下你的理解，从哪个角度分析都可以…"
                  className="w-full resize-none rounded-lg border border-white/10 bg-black/30 p-2.5 text-xs leading-relaxed text-mist-100 outline-none focus:border-btc-500/50 disabled:opacity-70"
                />
                <div className="mt-1 text-[10px] text-mist-600">判分方式：命中要点组即可，表述不必与标准答案逐字一致。</div>
              </div>
            )}

            {/* 提交按钮 */}
            {!isDone && (
              <div className="mt-2.5 pl-8">
                <button onClick={() => submit(q)} className="rounded-lg bg-btc-500/20 px-4 py-1.5 text-xs font-medium text-btc-300">提交答案</button>
              </div>
            )}

            {/* 判分结果与解析 */}
            {isDone && record && (
              <div className={`mt-2.5 ml-8 rounded-lg border p-2.5 ${record.correct ? 'border-emerald-400/25 bg-emerald-400/6' : 'border-rose-400/25 bg-rose-400/6'}`}>
                <div className={`mb-1 flex items-center gap-1.5 text-xs font-semibold ${record.correct ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {record.correct ? <><CheckCircle2 size={14} /> 回答正确</> : <><X size={14} /> 回答有误 · 已收入错题本</>}
                </div>
                <div className="text-[11px] leading-relaxed text-mist-300">{q.explanation}</div>
                {q.derivation && (
                  <div className="mt-2 rounded-md border border-white/10 bg-black/25 p-2.5">
                    <div className="mb-1 text-[10px] font-semibold text-ice-300">推导过程</div>
                    <div className="whitespace-pre-wrap text-[11px] leading-relaxed text-mist-300">{q.derivation}</div>
                  </div>
                )}
                {q.pitfalls && (
                  <div className="mt-2 flex gap-1.5 text-[10px] leading-relaxed text-amber-300/85">
                    <span className="shrink-0 font-semibold">易错</span><span>{q.pitfalls}</span>
                  </div>
                )}
                {keywordResult && keywordResult.missing && keywordResult.missing.length > 0 && (
                  <div className="mt-1.5 text-[10px] text-amber-300/80">未覆盖的要点：{keywordResult.missing.join('、')}</div>
                )}
              </div>
            )}
          </div>
        )
      })}
      <button onClick={onShowWrong} className="text-[11px] text-ice-300">去错题本复习 →</button>
    </div>
  )
}

function typeLabel(t: Question['type']): string {
  return { single: '单选', multiple: '多选', boolean: '判断', concept: '概念辨析', scenario: '场景分析' }[t]
}
