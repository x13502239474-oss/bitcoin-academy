import { useState } from 'react'
import { ChevronDown, Check, Clock, Play, Lock } from 'lucide-react'
import { useLearning } from '../store/LearningStore'
import { modules, lessonsByModule, moduleById } from '../data'
import { moduleColor } from '../components/ui/Primitives'
import { ProgressBar } from '../components/ui/Primitives'

export function CoursesPage({ openLesson }: { openLesson?: string }) {
  const { state } = useLearning()
  const [expanded, setExpanded] = useState<string[]>(() => {
    if (openLesson) {
      const l = moduleById.get(openLesson.slice(0, 2))
      return l ? [l.id] : ['01']
    }
    return ['01']
  })

  const toggle = (id: string) => setExpanded((e) => e.includes(id) ? e.filter((x) => x !== id) : [...e, id])

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-xl border border-ice-400/20 bg-ice-400/5 p-3.5 text-xs leading-relaxed text-ice-200/80">
        十个模块，从「为什么诞生」到「如何安全持有」，层层递进。建议按顺序学习；每节课约 8–12 分钟，含互动演示与随堂测试。
      </div>

      <div className="space-y-3">
        {modules.map((m) => {
          const ls = lessonsByModule(m.id)
          const done = ls.filter((l) => state.lessonProgress[l.id]?.completed).length
          const isOpen = expanded.includes(m.id)
          const c = moduleColor[m.color]
          return (
            <div key={m.id} className="panel overflow-hidden">
              <button onClick={() => toggle(m.id)} className="flex w-full items-center gap-3 p-4 text-left">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${c.border} ${c.bg} ${c.text}`}>
                  <span className="font-mono text-sm font-bold">{m.id}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-mist-100">{m.title}</h3>
                    {done === ls.length && <Check size={14} className="shrink-0 text-emerald-400" />}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-mist-500">{m.subtitle}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1"><ProgressBar value={(done / ls.length) * 100} tone={done === ls.length ? 'btc' : 'ice'} /></div>
                    <span className="shrink-0 font-mono text-[10px] text-mist-500">{done}/{ls.length}</span>
                  </div>
                </div>
                <ChevronDown size={18} className={`shrink-0 text-mist-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="border-t border-white/8 px-3 pb-3 pt-2">
                  <p className="mb-3 px-1 text-[11px] leading-relaxed text-mist-500">{m.description}</p>
                  <div className="space-y-1.5">
                    {ls.map((l) => {
                      const completed = state.lessonProgress[l.id]?.completed
                      return (
                        <a
                          key={l.id}
                          href={`#/lesson/${l.id}`}
                          className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 p-3 transition-colors active:border-btc-500/30"
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${completed ? 'bg-emerald-400/12 text-emerald-300' : 'bg-btc-500/10 text-btc-300'}`}>
                            {completed ? <Check size={15} /> : <Play size={13} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-medium text-mist-200">{l.title}</div>
                            <div className="flex items-center gap-2 text-[10px] text-mist-500">
                              <span className="flex items-center gap-1"><Clock size={10} /> {l.estMinutes} 分钟</span>
                              {l.labId && <span className="text-ice-400">含互动实验</span>}
                            </div>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
