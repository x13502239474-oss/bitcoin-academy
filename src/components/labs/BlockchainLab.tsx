import { useState } from 'react'
import { Link2, Box, ChevronLeft, ChevronRight, Layers, Hash, Info } from 'lucide-react'
import { sha256Hex } from '../../utils/crypto'
import { useEffect } from 'react'
import { shorten } from '../../utils/format'

/**
 * 区块链结构演示器
 * 点击区块查看：区块头字段、交易列表、前一区块哈希与当前哈希的链接关系
 */
interface Block {
  height: number
  timestamp: string
  txs: { from: string; to: string; amount: string }[]
  nonce: number
}

const BLOCKS: Block[] = [
  { height: 820000, timestamp: '2023-12-16 09:12', nonce: 2845193721, txs: [
    { from: 'coinbase', to: '矿工地址', amount: '6.25 BTC' },
    { from: 'A', to: 'B', amount: '0.0412 BTC' },
    { from: 'C', to: 'D', amount: '1.5000 BTC' },
  ] },
  { height: 820001, timestamp: '2023-12-16 09:18', nonce: 1150293847, txs: [
    { from: 'coinbase', to: '矿工地址', amount: '6.25 BTC' },
    { from: 'E', to: 'F', amount: '0.2200 BTC' },
  ] },
  { height: 820002, timestamp: '2023-12-16 09:25', nonce: 3891027455, txs: [
    { from: 'coinbase', to: '矿工地址', amount: '6.25 BTC' },
    { from: 'G', to: 'H', amount: '2.7500 BTC' },
    { from: 'I', to: 'J', amount: '0.0089 BTC' },
    { from: 'K', to: 'L', amount: '0.3100 BTC' },
  ] },
]

export function BlockchainLab() {
  const [selected, setSelected] = useState(0)
  const [hash, setHash] = useState('')
  const [prevHash, setPrevHash] = useState('')
  const block = BLOCKS[selected]

  useEffect(() => {
    let alive = true
    Promise.all([
      sha256Hex(`block-${block.height}-${block.nonce}-${block.txs.length}`),
      sha256Hex(`block-${block.height - 1}`),
    ]).then(([h, ph]) => { if (alive) { setHash(h); setPrevHash(ph) } })
    return () => { alive = false }
  }, [block])

  return (
    <div className="space-y-5">
      <div className="panel p-4">
        <div className="mb-2 flex items-center gap-2">
          <Link2 size={15} className="text-btc-400" />
          <span className="text-sm font-semibold text-mist-100">区块如何连成链？</span>
        </div>
        <p className="text-xs leading-relaxed text-mist-300">
          每个区块的头部都包含<em className="not-italic text-btc-300">前一区块的哈希</em>，像链条一样一环扣一环。改动任何一个历史区块，后面所有区块的哈希都会失效——这正是区块链难以篡改的原因。点击区块查看内部细节。
        </p>
      </div>

      {/* 区块链条 */}
      <div className="panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-mist-300">区块链（点击选择）</span>
          <span className="font-mono text-[10px] text-mist-500">高度 {block.height} / {BLOCKS[BLOCKS.length - 1].height}</span>
        </div>
        <div className="flex items-stretch gap-1.5 overflow-x-auto pb-2">
          {BLOCKS.map((b, i) => (
            <div key={b.height} className="flex items-center gap-1.5">
              <button
                onClick={() => setSelected(i)}
                className={`flex min-w-[88px] shrink-0 flex-col items-center rounded-xl border px-3 py-3 transition-all ${
                  i === selected ? 'border-btc-500 bg-btc-500/12 shadow-glow-btc' : 'border-white/10 bg-white/4'
                }`}
              >
                <Box size={18} className={i === selected ? 'text-btc-300' : 'text-mist-500'} />
                <div className={`mt-1 font-mono text-[11px] ${i === selected ? 'text-btc-300' : 'text-mist-400'}`}>#{b.height}</div>
                <div className="text-[9px] text-mist-600">{b.txs.length} 笔交易</div>
              </button>
              {i < BLOCKS.length - 1 && (
                <div className="flex flex-col items-center text-mist-600">
                  <Link2 size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <button onClick={() => setSelected((s) => Math.max(0, s - 1))} disabled={selected === 0} className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-mist-300 disabled:opacity-30">
            <ChevronLeft size={13} /> 上一块
          </button>
          <button onClick={() => setSelected((s) => Math.min(BLOCKS.length - 1, s + 1))} disabled={selected === BLOCKS.length - 1} className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-mist-300 disabled:opacity-30">
            下一块 <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* 区块详情 */}
      <div className="panel p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-mist-100"><Box size={15} className="text-ice-300" /> 区块 #{block.height}</div>

        <div className="mb-3 rounded-lg border border-ice-400/20 bg-ice-400/5 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-ice-300"><Hash size={13} /> 区块头 Block Header</div>
          <Field label="版本 Version" value="0x20000000" />
          <Field label="时间戳 Time" value={block.timestamp} />
          <Field label="难度目标 Bits" value="0x1d00ffff" />
          <Field label="Nonce" value={block.nonce.toLocaleString()} />
        </div>

        <div className="mb-3 space-y-2">
          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <div className="mb-1 text-[10px] font-semibold text-mist-500">前一区块哈希 Prev Block Hash</div>
            <div className="break-all font-mono text-[10px] text-ice-300">{prevHash}</div>
          </div>
          <div className="flex justify-center"><ArrowDownMini /></div>
          <div className="rounded-lg border border-btc-500/25 bg-btc-500/5 p-2.5">
            <div className="mb-1 text-[10px] font-semibold text-mist-500">当前区块哈希 Current Block Hash</div>
            <div className="break-all font-mono text-[10px] text-btc-300">{hash}</div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-mist-300"><Layers size={13} /> 交易列表（{block.txs.length} 笔）</div>
          <div className="space-y-1.5">
            {block.txs.map((tx, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-2.5 py-2 text-[11px]">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-btc-500/15 font-mono text-[9px] text-btc-300">{i}</span>
                <span className="text-mist-400">{tx.from}</span>
                <span className="text-mist-600">→</span>
                <span className="text-mist-300">{tx.to}</span>
                <span className="ml-auto font-mono text-btc-300">{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 text-[10px] text-mist-500">
          第一笔都是 coinbase 交易（区块奖励 + 手续费），由矿工创建，它让区块里「凭空」出现新币——这是新币发行的唯一方式。
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-white/8 bg-white/3 p-3 text-[11px] leading-relaxed text-mist-400">
        <Info size={14} className="mt-0.5 shrink-0 text-mist-500" />
        <span><strong className="text-mist-200">教学说明：</strong>此处的哈希与区块数据为演示生成的模拟数据，用于说明「前一区块哈希被包含在当前区块中」的链接结构；真实区块头还包含 Merkle 根等字段，哈希需满足难度目标。交易金额与地址均为示意。</span>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5 text-[11px]">
      <span className="text-mist-500">{label}</span>
      <span className="font-mono text-mist-200">{value}</span>
    </div>
  )
}

function ArrowDownMini() {
  return <div className="flex h-4 w-4 items-center justify-center text-btc-500">↓</div>
}
