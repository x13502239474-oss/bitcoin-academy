import type { ContentBlock } from '../../types'

const toneMap = {
  info: { border: 'border-ice-400/30', bg: 'bg-ice-400/8', label: 'text-ice-300', tag: '说明' },
  warn: { border: 'border-amber-400/30', bg: 'bg-amber-400/8', label: 'text-amber-300', tag: '注意' },
  key: { border: 'border-btc-500/30', bg: 'bg-btc-500/8', label: 'text-btc-300', tag: '要点' },
}

/** 渲染可能含 <em>/<strong>/<code> 的富文本片段（受控标签，安全） */
function RichText({ text }: { text: string }) {
  // 只替换允许的三种内联标签，避免注入
  const parts = text.split(/(<em>.*?<\/em>|<strong>.*?<\/strong>|<code>.*?<\/code>)/g)
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('<em>')) return <em key={i}>{p.slice(4, -5)}</em>
        if (p.startsWith('<strong>')) return <strong key={i}>{p.slice(8, -9)}</strong>
        if (p.startsWith('<code>')) return <code key={i}>{p.slice(6, -7)}</code>
        return <span key={i}>{p}</span>
      })}
    </>
  )
}

export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="prose-ba">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'heading':
            return <h4 key={i} className="mt-6 border-l-2 border-btc-500/60 pl-3"><RichText text={b.text} /></h4>
          case 'paragraph':
            return <p key={i}><RichText text={b.text} /></p>
          case 'list':
            return b.ordered
              ? <ol key={i}>{b.items.map((it, j) => <li key={j}><RichText text={it} /></li>)}</ol>
              : <ul key={i}>{b.items.map((it, j) => <li key={j}><RichText text={it} /></li>)}</ul>
          case 'callout': {
            const t = toneMap[b.tone]
            return (
              <div key={i} className={`my-4 rounded-xl border ${t.border} ${t.bg} p-3.5`}>
                <div className={`mb-1 flex items-center gap-2 text-xs font-semibold ${t.label}`}>
                  <span className="rounded bg-black/25 px-1.5 py-0.5 text-[10px]">{t.tag}</span>
                  <RichText text={b.title} />
                </div>
                <div className="text-sm leading-relaxed text-mist-200"><RichText text={b.text} /></div>
              </div>
            )
          }
          case 'code':
            return (
              <div key={i} className="my-4">
                <pre className="code-block overflow-x-auto p-3.5 leading-relaxed"><code>{b.text}</code></pre>
                {b.caption && <div className="mt-1 text-[10px] text-mist-500">{b.caption}</div>}
              </div>
            )
          case 'table':
            return (
              <div key={i} className="my-4 overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full min-w-[420px] text-left text-xs">
                  <thead className="bg-white/5 text-mist-300">
                    <tr>{b.headers.map((h, j) => <th key={j} className="whitespace-nowrap px-3 py-2 font-semibold">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, r) => (
                      <tr key={r} className="border-t border-white/8">
                        {row.map((cell, c) => <td key={c} className="px-3 py-2 align-top text-mist-300"><RichText text={cell} /></td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          case 'compare':
            return (
              <div key={i} className="my-4">
                <div className="mb-2 text-xs font-semibold text-mist-200">{b.title}</div>
                <div className="grid grid-cols-2 gap-2">
                  {[b.left, b.right].map((side, si) => (
                    <div key={si} className={`rounded-xl border p-3 ${si === 0 ? 'border-ice-400/25 bg-ice-400/5' : 'border-btc-500/25 bg-btc-500/5'}`}>
                      <div className={`mb-2 text-xs font-semibold ${si === 0 ? 'text-ice-300' : 'text-btc-300'}`}>{side.label}</div>
                      <ul className="space-y-1.5">
                        {side.points.map((p, j) => (
                          <li key={j} className="flex gap-1.5 text-[11px] leading-snug text-mist-300">
                            <span className={si === 0 ? 'text-ice-400' : 'text-btc-400'}>·</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
