import { useEffect, useState } from 'react'
import { Hash, Shuffle, Copy, Check } from 'lucide-react'
import { sha256Hex } from '../../utils/crypto'

/** 哈希函数演示器 —— 使用真实 SHA-256 */
export function HashLab() {
  const [input, setInput] = useState('Hello, Bitcoin!')
  const [hash, setHash] = useState('')
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<{ input: string; hash: string }[]>([])

  useEffect(() => {
    let alive = true
    sha256Hex(input).then((h) => {
      if (!alive) return
      setHash(h)
    })
    return () => { alive = false }
  }, [input])

  const commit = () => {
    if (!hash) return
    setHistory((prev) => [{ input, hash }, ...prev].slice(0, 5))
  }

  const flipBit = () => setInput((s) => s + (Math.random() > 0.5 ? 'a' : '!'))

  const copy = async () => {
    try { await navigator.clipboard.writeText(hash) } catch { /* 忽略 */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  // 可视化：把哈希按字符着色（前 8 位橙色）
  const renderHash = () => {
    if (!hash) return <span className="text-mist-600">计算中…</span>
    return <><span className="text-btc-300">{hash.slice(0, 8)}</span><span className="text-mist-400">{hash.slice(8)}</span></>
  }

  return (
    <div className="space-y-5">
      <div className="panel p-4">
        <div className="mb-2 flex items-center gap-2">
          <Hash size={15} className="text-btc-400" />
          <span className="text-sm font-semibold text-mist-100">SHA-256 哈希演示器</span>
          <span className="ml-auto rounded bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">真实算法</span>
        </div>
        <p className="text-xs leading-relaxed text-mist-300">
          哈希函数把任意长度的数据，映射成固定 256 位（64 个十六进制字符）的「指纹」。输入哪怕改动一个字符，输出也会完全不同——这叫雪崩效应。
        </p>
      </div>

      <div className="panel p-4">
        <label className="mb-1.5 block text-xs text-mist-400">输入任意文本</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-mist-100 outline-none focus:border-btc-500/50"
          placeholder="输入点什么试试…"
        />
        <div className="mt-2 flex gap-2">
          <button onClick={flipBit} className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs text-mist-200">
            <Shuffle size={14} /> 改动一个字符
          </button>
          <button onClick={commit} className="rounded-lg border border-btc-500/30 bg-btc-500/10 px-3 py-2 text-xs text-btc-300">记录这次结果</button>
        </div>
      </div>

      <div className="panel p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-mist-300">SHA-256 输出</span>
          <button onClick={copy} className="flex items-center gap-1 text-[11px] text-ice-300">
            {copied ? <><Check size={13} /> 已复制</> : <><Copy size={13} /> 复制</>}
          </button>
        </div>
        <div className="code-block break-all p-3 font-mono text-xs leading-relaxed">{renderHash()}</div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px] text-mist-500">
          <div className="rounded-lg bg-white/4 py-2">长度<br /><span className="font-mono text-mist-200">64 字符</span></div>
          <div className="rounded-lg bg-white/4 py-2">位数<br /><span className="font-mono text-mist-200">256 bit</span></div>
          <div className="rounded-lg bg-white/4 py-2">前 8 位<br /><span className="font-mono text-btc-300">{hash.slice(0, 8) || '—'}</span></div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="panel p-4">
          <div className="mb-2 text-xs font-semibold text-mist-300">对比记录（感受雪崩效应）</div>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="rounded-lg border border-white/8 bg-black/20 p-2.5">
                <div className="truncate text-[11px] text-mist-400">输入：{h.input || '（空）'}</div>
                <div className="mt-1 truncate font-mono text-[11px] text-btc-300">{h.hash}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/8 bg-white/3 p-3 text-[11px] leading-relaxed text-mist-400">
        <strong className="text-mist-200">不可逆性：</strong>你无法从哈希值反推出输入。这个「单向」特性，正是比特币安全性与工作量证明的基础。此演示使用浏览器内置的 Web Crypto API，是真实的 SHA-256 实现。
      </div>
    </div>
  )
}
