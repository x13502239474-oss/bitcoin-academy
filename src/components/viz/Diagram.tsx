import type { DiagramSpec } from '../../types'

const toneStyle = {
  btc: 'border-btc-500/50 bg-btc-500/10 text-btc-300',
  ice: 'border-ice-400/50 bg-ice-400/10 text-ice-300',
  plain: 'border-white/15 bg-white/5 text-mist-200',
}

/** 流程图 / 循环图：水平（窄屏回绕）节点 + 箭头 */
function FlowDiagram({ spec }: { spec: DiagramSpec }) {
  const edges = spec.edges ?? []
  return (
    <div className="space-y-2">
      {spec.nodes.map((n, i) => (
        <div key={n.id}>
          <div className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 ${toneStyle[n.tone ?? 'plain']}`}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-black/25 font-mono text-[11px]">{i + 1}</span>
            <div className="min-w-0">
              <div className="text-sm font-medium">{n.label}</div>
              {n.sub && <div className="text-[11px] opacity-70">{n.sub}</div>}
            </div>
          </div>
          {i < spec.nodes.length - 1 && (
            <div className="ml-5 flex h-5 items-center">
              <div className="h-full w-px bg-gradient-to-b from-white/25 to-white/5" />
              <div className="-ml-1 h-1.5 w-1.5 rotate-45 border-b border-r border-white/30" />
            </div>
          )}
        </div>
      ))}
      {edges.length > spec.nodes.length && (
        <div className="pt-1 text-[10px] text-mist-500">共 {edges.length} 条关联</div>
      )}
    </div>
  )
}

/** 分层图：按 group 把节点分层展示 */
function LayersDiagram({ spec }: { spec: DiagramSpec }) {
  return (
    <div className="space-y-3">
      {(spec.groups ?? [{ label: '', nodeIds: spec.nodes.map((n) => n.id) }]).map((g, gi) => (
        <div key={gi}>
          {g.label && <div className="mb-1.5 text-[11px] font-semibold tracking-wider text-mist-500">{g.label}</div>}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {g.nodeIds.map((id) => {
              const n = spec.nodes.find((x) => x.id === id)
              if (!n) return null
              return (
                <div key={id} className={`rounded-lg border px-2.5 py-2 text-center ${toneStyle[n.tone ?? 'plain']}`}>
                  <div className="text-xs font-medium leading-tight">{n.label}</div>
                  {n.sub && <div className="mt-0.5 text-[10px] opacity-70">{n.sub}</div>}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * 区块链接图：竖向堆叠区块卡片，卡片内的 prev_hash 指针用「链路条」显式连到上一个区块
 * 用于「区块头如何指向前一区块」「链式结构为什么不可篡改」这类讲解
 */
function ChainDiagram({ spec }: { spec: DiagramSpec }) {
  return (
    <div className="space-y-0">
      {spec.nodes.map((n, i) => (
        <div key={n.id}>
          <div className="overflow-hidden rounded-xl border border-white/12 bg-black/25">
            <div className="flex items-center gap-2 border-b border-white/8 bg-white/4 px-3 py-1.5">
              <span className={`text-xs font-semibold ${n.tone === 'btc' ? 'text-btc-300' : n.tone === 'ice' ? 'text-ice-300' : 'text-mist-200'}`}>{n.label}</span>
            </div>
            {n.sub && <div className="px-3 py-2 font-mono text-[10px] leading-relaxed text-mist-400">{n.sub}</div>}
          </div>
          {i < spec.nodes.length - 1 && (
            <div className="flex items-center gap-1.5 py-1 pl-3">
              <div className="h-3.5 w-px bg-white/20" />
              <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-mist-500">prev_hash 指向下方的前一个区块头</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Merkle 树：按 groups 从上到下（根 → 叶子）逐层展示，每层标注层级含义
 * 用于「Merkle Root 如何把一笔交易锁进区块头」
 */
function MerkleDiagram({ spec }: { spec: DiagramSpec }) {
  const groups = spec.groups ?? [{ label: '', nodeIds: spec.nodes.map((n) => n.id) }]
  return (
    <div className="space-y-2">
      {groups.map((g, gi) => (
        <div key={gi}>
          {g.label && <div className="mb-1 text-[10px] font-semibold tracking-wider text-mist-500">{g.label}</div>}
          <div className="flex flex-wrap justify-center gap-1.5">
            {g.nodeIds.map((id) => {
              const n = spec.nodes.find((x) => x.id === id)
              if (!n) return null
              return (
                <div key={id} className={`min-w-0 flex-1 rounded-lg border px-1.5 py-1.5 text-center ${toneStyle[n.tone ?? 'plain']}`}>
                  <div className="truncate font-mono text-[9px] leading-tight">{n.label}</div>
                  {n.sub && <div className="mt-0.5 truncate text-[9px] opacity-60">{n.sub}</div>}
                </div>
              )
            })}
          </div>
          {gi < groups.length - 1 && (
            <div className="mt-1 flex justify-center">
              <span className="font-mono text-[10px] text-mist-600">↑ HASH256(左 ‖ 右)</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function DiagramBody({ spec }: { spec: DiagramSpec }) {
  switch (spec.kind) {
    case 'layers':
    case 'tree':
      return <LayersDiagram spec={spec} />
    case 'chain':
      return <ChainDiagram spec={spec} />
    case 'merkle':
      return <MerkleDiagram spec={spec} />
    default:
      return <FlowDiagram spec={spec} />
  }
}

export function Diagram({ spec }: { spec: DiagramSpec }) {
  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-btc-500" />
        <div className="text-xs font-semibold tracking-wide text-mist-200">{spec.title}</div>
      </div>
      <DiagramBody spec={spec} />
      {spec.caption && <p className="mt-3 text-[10px] leading-relaxed text-mist-500">{spec.caption}</p>}
    </div>
  )
}
