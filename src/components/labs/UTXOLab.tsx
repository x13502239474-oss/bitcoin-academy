import { useMemo, useState } from 'react'
import { ArrowRight, RefreshCw, CircleCheck, Radio, Pickaxe, Layers, Info } from 'lucide-react'
import { fmtBTC, fmtSats } from '../../utils/format'

/**
 * UTXO 交易模拟器 —— 全站核心交互
 * 场景：Alice 持有 1 BTC（单个 UTXO），向 Bob 转账 0.3 BTC
 * 完整演示：输入 UTXO → 输出（Bob 收款 + Alice 找零）→ 手续费 → 广播 → 交易池 → 矿工打包 → 确认
 * 所有金额以「聪」为最小单位计算，避免浮点误差
 */

const SATS_PER_BTC = 100_000_000
type Stage = 'build' | 'signed' | 'broadcast' | 'mempool' | 'mining' | 'confirmed'

const stageOrder: Stage[] = ['build', 'signed', 'broadcast', 'mempool', 'mining', 'confirmed']
const stageLabels: Record<Stage, string> = {
  build: '构造交易',
  signed: '已签名',
  broadcast: '广播中',
  mempool: '进入交易池',
  mining: '矿工打包',
  confirmed: '已确认',
}

export function UTXOLab() {
  const [sendAmount, setSendAmount] = useState(0.3)
  const [feeRate, setFeeRate] = useState(10) // sat/vB
  const [stageIdx, setStageIdx] = useState(0)
  const [txid, setTxid] = useState('4a5e1e7ba89f0d2c' + '8f3b' + '91a2c4e6d7f8091b' + 'a3c5e7f9')

  const stage = stageOrder[stageIdx]

  // 以聪为单位计算
  const calc = useMemo(() => {
    const inputSats = 1 * SATS_PER_BTC // Alice 的单一 UTXO = 1 BTC
    const sendSats = Math.round(sendAmount * SATS_PER_BTC)
    const txVirtualSize = 140 // 典型 1 输入 2 输出交易的虚拟字节数（简化固定）
    const feeSats = feeRate * txVirtualSize
    const changeSats = inputSats - sendSats - feeSats
    return { inputSats, sendSats, feeSats, changeSats, txVirtualSize, valid: changeSats >= 0 }
  }, [sendAmount, feeRate])

  const advance = () => setStageIdx((i) => Math.min(stageOrder.length - 1, i + 1))
  const reset = () => {
    setStageIdx(0)
    setTxid('4a5e1e7ba89f0d2c' + '8f3b' + '91a2c4e6d7f8091b' + 'a3c5e7f9')
  }
  const randomizeTxid = () => {
    const hex = '0123456789abcdef'
    let s = ''
    for (let i = 0; i < 64; i++) s += hex[Math.floor(Math.random() * 16)]
    setTxid(s)
  }

  const confirmations = stage === 'confirmed' ? 1 : stageIdx > stageOrder.indexOf('confirmed') ? 2 : 0

  return (
    <div className="space-y-5">
      {/* 场景说明 */}
      <div className="panel p-4">
        <div className="mb-2 flex items-center gap-2">
          <Info size={15} className="text-btc-400" />
          <span className="text-sm font-semibold text-mist-100">场景设定</span>
        </div>
        <p className="text-xs leading-relaxed text-mist-300">
          Alice 的钱包里有 <em className="text-btc-300 not-italic">1 BTC</em>，这是一个尚未花费的输出（UTXO）。她要给 Bob 转一笔钱。
          你来调整金额与手续费，亲手走完这笔交易的每一步。
        </p>
      </div>

      {/* 参数控制 */}
      <div className="panel p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-mist-400">转账给 Bob</span>
              <span className="font-mono text-btc-300">{sendAmount.toFixed(4)} BTC</span>
            </div>
            <input
              type="range"
              min={0.01}
              max={0.99}
              step={0.01}
              value={sendAmount}
              onChange={(e) => { setSendAmount(Number(e.target.value)); reset() }}
              className="w-full accent-btc-500"
              disabled={stageIdx > 0}
            />
          </label>
          <label className="block">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-mist-400">手续费率</span>
              <span className="font-mono text-ice-300">{feeRate} sat/vB</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={feeRate}
              onChange={(e) => { setFeeRate(Number(e.target.value)); reset() }}
              className="w-full accent-ice-400"
              disabled={stageIdx > 0}
            />
          </label>
        </div>
        {!calc.valid && (
          <div className="mt-3 rounded-lg border border-rose-400/30 bg-rose-400/8 p-2.5 text-xs text-rose-300">
            金额加手续费超过了 Alice 的 1 BTC。请降低转账金额或手续费率。
          </div>
        )}
      </div>

      {/* 交易结构图：输入 → 输出 */}
      <div className="panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-mist-100">
            <Layers size={15} className="text-ice-300" /> 交易结构
          </div>
          <span className="font-mono text-[10px] text-mist-500">虚拟大小 ≈ {calc.txVirtualSize} vB</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          {/* 输入 */}
          <div className="rounded-xl border border-ice-400/25 bg-ice-400/5 p-3">
            <div className="mb-2 text-[10px] font-semibold tracking-wider text-ice-300">输入 INPUT（消费已有 UTXO）</div>
            <div className="space-y-1.5">
              <TxRow label="来源" value="Alice 的 1 BTC UTXO" />
              <TxRow label="金额" value={fmtBTC(calc.inputSats / SATS_PER_BTC) + ' BTC'} mono tone="ice" />
              <TxRow label="状态" value={stageIdx >= 3 ? '已花费 (spent)' : '未花费 (unspent)'} />
            </div>
          </div>

          <div className="flex justify-center sm:px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-ink-850">
              <ArrowRight size={16} className="rotate-90 text-btc-400 sm:rotate-0" />
            </div>
          </div>

          {/* 输出 */}
          <div className="space-y-2">
            <div className="rounded-xl border border-btc-500/25 bg-btc-500/5 p-3">
              <div className="mb-2 text-[10px] font-semibold tracking-wider text-btc-300">输出 0 · Bob 收款</div>
              <div className="space-y-1.5">
                <TxRow label="接收方" value="Bob 的地址" />
                <TxRow label="金额" value={fmtBTC(calc.sendSats / SATS_PER_BTC) + ' BTC'} mono tone="btc" />
              </div>
            </div>
            <div className="rounded-xl border border-white/12 bg-white/4 p-3">
              <div className="mb-2 text-[10px] font-semibold tracking-wider text-mist-400">输出 1 · Alice 找零</div>
              <div className="space-y-1.5">
                <TxRow label="接收方" value="Alice 自己的新地址" />
                <TxRow label="金额" value={fmtBTC(calc.changeSats / SATS_PER_BTC) + ' BTC'} mono />
              </div>
            </div>
          </div>
        </div>

        {/* 平衡校验 */}
        <div className="mt-3 rounded-lg border border-white/8 bg-black/20 p-2.5 font-mono text-[11px] leading-relaxed text-mist-400">
          <div>输入 {fmtSats(calc.inputSats)} = 收款 {fmtSats(calc.sendSats)} + 找零 {fmtSats(calc.changeSats)} + 手续费 {fmtSats(calc.feeSats)}</div>
          <div className="mt-0.5 text-btc-300">手续费 = 输入 − 全部输出 = {fmtSats(calc.feeSats)}（归矿工所有）</div>
        </div>
        <div className="mt-2 text-[10px] leading-relaxed text-mist-500">
          关键点：Alice 并没有一个「余额账户」。她花费的是一整个 1 BTC 的 UTXO，再收到一个新的找零 UTXO。找零不是「系统退还」，而是交易里显式写出的一个新输出。
        </div>
      </div>

      {/* 交易 ID */}
      <div className="panel p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-mist-300">交易 ID（TXID）</span>
          <button onClick={randomizeTxid} className="text-[11px] text-ice-300 active:text-ice-200">换个哈希 ↻</button>
        </div>
        <div className="code-block p-3 text-btc-300">{txid}</div>
        <div className="mt-1.5 text-[10px] text-mist-500">TXID 是整笔交易数据的哈希值，由签名后的交易内容决定。这里为演示随机生成。</div>
      </div>

      {/* 生命周期时间线 */}
      <div className="panel p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-mist-100">
          <Radio size={15} className="text-btc-400" /> 交易生命周期
        </div>
        <div className="space-y-1.5">
          {stageOrder.map((s, i) => {
            const done = i < stageIdx
            const current = i === stageIdx
            return (
              <div key={s} className={`flex items-center gap-3 rounded-lg px-2.5 py-2 ${current ? 'bg-btc-500/10' : ''}`}>
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                  done ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-300'
                    : current ? 'border-btc-500 bg-btc-500/20 text-btc-300'
                      : 'border-white/10 text-mist-600'}`}>
                  {done ? <CircleCheck size={13} /> : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-medium ${current ? 'text-btc-300' : done ? 'text-mist-200' : 'text-mist-600'}`}>{stageLabels[s]}</div>
                  <div className="text-[10px] text-mist-500">{stageHint(s)}</div>
                </div>
                {current && <span className="text-[10px] text-btc-400">◀ 当前</span>}
              </div>
            )
          })}
        </div>

        {stage === 'confirmed' && (
          <div className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-400/8 p-3 text-xs text-emerald-200">
            <div className="flex items-center gap-2 font-semibold"><CircleCheck size={15} /> 交易已确认，获得 {confirmations} 个确认</div>
            <p className="mt-1 text-[11px] leading-relaxed text-emerald-200/80">
              交易已被打包进区块并广播全网。注意：广播（进入交易池）和确认（被打包进区块）是两回事——这正是很多人混淆的地方。
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mt-4 flex gap-2">
          {stageIdx < stageOrder.length - 1 ? (
            <button
              onClick={advance}
              disabled={!calc.valid}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-btc-600 to-btc-500 py-3 text-sm font-semibold text-white shadow-glow-btc disabled:opacity-40"
            >
              {stage === 'mempool' ? <><Pickaxe size={16} /> 模拟矿工打包</> : <><ArrowRight size={16} /> {nextAction(stage)}</>}
            </button>
          ) : (
            <button onClick={reset} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-medium text-mist-200">
              <RefreshCw size={15} /> 重新开始
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/3 p-3 text-[11px] leading-relaxed text-mist-400">
        <strong className="text-mist-200">教学说明：</strong>本模拟固定了交易虚拟大小以简化手续费计算，真实交易的手续费取决于交易的实际字节大小与内存池拥挤程度。UTXO 的选择、签名验证等步骤在此做了简化，但资金流动逻辑与真实规则一致。
      </div>
    </div>
  )
}

function TxRow({ label, value, mono, tone }: { label: string; value: string; mono?: boolean; tone?: 'btc' | 'ice' }) {
  const color = tone === 'btc' ? 'text-btc-300' : tone === 'ice' ? 'text-ice-300' : 'text-mist-200'
  return (
    <div className="flex items-center justify-between gap-2 text-[11px]">
      <span className="text-mist-500">{label}</span>
      <span className={`${mono ? 'font-mono' : ''} ${color} truncate text-right`}>{value}</span>
    </div>
  )
}

function stageHint(s: Stage): string {
  switch (s) {
    case 'build': return '钱包挑选 UTXO，确定收款与找零输出'
    case 'signed': return '用 Alice 的私钥为交易签名，证明有权花费'
    case 'broadcast': return '把签名交易发送到相邻节点'
    case 'mempool': return '交易在全网节点的交易池中等待'
    case 'mining': return '矿工把交易打包进候选区块'
    case 'confirmed': return '区块被接受，交易获得确认'
  }
}

function nextAction(s: Stage): string {
  switch (s) {
    case 'build': return '用私钥签名交易'
    case 'signed': return '广播交易'
    case 'broadcast': return '查看交易池'
    case 'mempool': return '准备打包'
    default: return '下一步'
  }
}
