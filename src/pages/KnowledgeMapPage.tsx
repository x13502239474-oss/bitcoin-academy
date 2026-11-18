import { useMemo, useState } from 'react'
import { Network, X, ArrowRight, Route, CheckCircle2 } from 'lucide-react'
import { useLearning } from '../store/LearningStore'
import { mapNodes, mapEdges, LEARNING_PATH, moduleById } from '../data'
import { Pill } from '../components/ui/Primitives'
import type { MapNode } from '../types'

interface Props {
  onOpenLesson: (id: string) => void
  onOpenLab: (id: string) => void
}

export function KnowledgeMapPage({ onOpenLesson, onOpenLab }: Props) {
  const { state } = useLearning()
  const [selected, setSelected] = useState<MapNode | null>(null)
  const [tab, setTab] = useState<'map' | 'path'>('map')

  const neighbors = useMemo(() => {
    if (!selected) return new Set<string>()
    const s = new Set<string>()
    mapEdges.forEach((e) => {
      if (e.from === selected.id) s.add(e.to)
      if (e.to === selected.id) s.add(e.from)
    })
    return s
  }, [selected])

  const isVisited = (n: MapNode) => {
    if (n.target.kind === 'lesson') return !!state.lessonProgress[n.target.id]?.completed
    return !!state.labResults[n.target.id]
  }

  const openNode = (n: MapNode) => {
    if (n.target.kind === 'lesson') onOpenLesson(n.target.id)
    else onOpenLab(n.target.id)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="rounded-xl border border-ice-400/20 bg-ice-400/5 p-3.5 text-xs leading-relaxed text-ice-200/80">
        比特币不是一堆孤立的概念，而是一台由密码学、交易、区块、共识层层咬合的机器。点击任意节点可跳转到对应课程或实验，观察知识点之间的连接。
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2">
        <button onClick={() => setTab('map')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium ${tab === 'map' ? 'border-btc-500/40 bg-btc-500/10 text-btc-300' : 'border-white/10 text-mist-400'}`}>
          <Network size={15} /> 关系图
        </button>
        <button onClick={() => setTab('path')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium ${tab === 'path' ? 'border-ice-400/40 bg-ice-400/10 text-ice-300' : 'border-white/10 text-mist-400'}`}>
          <Route size={15} /> 学习主线
        </button>
      </div>

      {tab === 'map' ? (
        <>
          {/* 关系图 */}
          <div className="panel overflow-hidden p-3">
            {/* 连线层与节点层共用同一坐标容器 */}
            <div className="relative" style={{ height: 460 }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 z" fill="rgba(120,150,200,0.5)" />
                </marker>
              </defs>
              {mapEdges.map((e, i) => {
                const from = mapNodes.find((n) => n.id === e.from)!
                const to = mapNodes.find((n) => n.id === e.to)!
                const active = selected && (e.from === selected.id || e.to === selected.id)
                return (
                  <line
                    key={i}
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={active ? 'rgba(247,147,26,0.75)' : 'rgba(120,150,200,0.22)'}
                    strokeWidth={active ? 0.6 : 0.3}
                    markerEnd="url(#arrow)"
                    vectorEffect="non-scaling-stroke"
                  />
                )
              })}
            </svg>
            {/* 节点用绝对百分比定位 */}
            <div className="absolute inset-0">
              {mapNodes.map((n) => {
                const visited = isVisited(n)
                const dim = selected && !neighbors.has(n.id) && selected.id !== n.id
                const tone = n.tone === 'btc' ? 'border-btc-500/60 bg-btc-500/15 text-btc-200'
                  : n.tone === 'ice' ? 'border-ice-400/50 bg-ice-400/12 text-ice-200'
                    : 'border-white/20 bg-ink-800/90 text-mist-200'
                return (
                  <button
                    key={n.id}
                    onClick={() => setSelected(n)}
                    className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-lg border px-2 py-1 text-center text-[10px] font-medium leading-tight shadow-panel backdrop-blur transition-all ${tone} ${dim ? 'opacity-35' : 'opacity-100'} ${selected?.id === n.id ? 'ring-2 ring-btc-500/60' : ''}`}
                    style={{ left: `${n.x}%`, top: `${n.y}%` }}
                  >
                    {visited && <CheckCircle2 size={10} className="shrink-0 text-emerald-400" />}
                    <span className="whitespace-nowrap">{n.label}</span>
                  </button>
                )
              })}
            </div>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-white/8 pt-2 text-[10px] text-mist-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-btc-500" /> 核心概念</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-ice-400" /> 技术机制</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-emerald-400" /> 已学过</span>
            </div>
          </div>

          {/* 选中节点详情 */}
          {selected && (
            <div className="panel p-4 animate-fade-in">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-mist-100">{selected.label}</h3>
                    {isVisited(selected) && <Pill tone="good">已学</Pill>}
                  </div>
                  <div className="mt-0.5 text-[11px] text-mist-500">所属模块 {selected.moduleId} · {moduleById.get(selected.moduleId)?.title}</div>
                </div>
                <button onClick={() => setSelected(null)} className="text-mist-600"><X size={17} /></button>
              </div>
              <div className="mb-3 text-[11px] leading-relaxed text-mist-400">
                关联 {neighbors.size} 个知识点：{Array.from(neighbors).map((id) => mapNodes.find((n) => n.id === id)?.label).filter(Boolean).join('、')}
              </div>
              <button onClick={() => openNode(selected)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-btc-600 to-btc-500 py-2.5 text-xs font-semibold text-white">
                前往{selected.target.kind === 'lesson' ? '课程' : '实验'} <ArrowRight size={14} />
              </button>
            </div>
          )}
        </>
      ) : (
        /* 学习主线 */
        <div className="panel p-4">
          <div className="mb-4 text-xs leading-relaxed text-mist-400">
            这是一条推荐的理解路径：先懂密码学，再看它如何支撑交易，交易如何组成区块，区块如何连成链，以及共识如何让陌生人信任同一条链。
          </div>
          <div className="space-y-1">
            {LEARNING_PATH.map((id, i) => {
              const n = mapNodes.find((x) => x.id === id)!
              const visited = isVisited(n)
              return (
                <div key={id}>
                  <button onClick={() => openNode(n)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${visited ? 'border-emerald-400/25 bg-emerald-400/5' : 'border-white/8 bg-white/3'}`}>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] ${visited ? 'bg-emerald-400/15 text-emerald-300' : 'bg-btc-500/10 text-btc-300'}`}>
                      {visited ? <CheckCircle2 size={15} /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-mist-200">{n.label}</div>
                      <div className="text-[10px] text-mist-500">{n.target.kind === 'lesson' ? '课程' : '实验'} · 模块 {n.moduleId}</div>
                    </div>
                    <ArrowRight size={14} className="text-mist-600" />
                  </button>
                  {i < LEARNING_PATH.length - 1 && <div className="flex justify-center py-0.5"><div className="h-3 w-px bg-white/15" /></div>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
