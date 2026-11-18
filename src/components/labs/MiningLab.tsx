import { useEffect, useRef, useState } from 'react'
import { Pickaxe, Play, Pause, RotateCcw, Hash, Target, Zap, Info } from 'lucide-react'
import { sha256Bytes, bytesToHex, leadingZeroBits } from '../../utils/crypto'

/**
 * PoW 挖矿模拟器 —— 重点交互
 * 使用真实 SHA-256（Web Crypto），调整难度（前导零位数），遍历 nonce 寻找满足目标值的哈希
 * 明确说明：教学难度远低于真实网络；真实挖矿还涉及区块头组装、难度目标编码、批量 ASIC 等
 */

interface BlockHeader {
  version: string
  prevHash: string
  merkleRoot: string
  time: number
  bits: number // 难度：要求的前导零位数
}

const DEFAULT_HEADER: BlockHeader = {
  version: '0x20000000',
  prevHash: '000000000019d6689c085ae165831e93'.padEnd(64, '0').slice(0, 64),
  merkleRoot: '4a5e1e7ba89f0d2c8f3b91a2c4e6d7f8091ba3c5e7f9d2b4a8c1e6f3092d57b8'.slice(0, 64),
  time: 1700000000,
  bits: 3,
}

export function MiningLab() {
  const [bits, setBits] = useState(3)
  const [nonce, setNonce] = useState(0)
  const [currentHash, setCurrentHash] = useState('')
  const [currentZeros, setCurrentZeros] = useState(0)
  const [bestZeros, setBestZeros] = useState(0)
  const [mining, setMining] = useState(false)
  const [found, setFound] = useState<{ nonce: number; hash: string; tries: number; ms: number } | null>(null)
  const [totalHashes, setTotalHashes] = useState(0)
  const startRef = useRef(0)
  const nonceRef = useRef(0)
  const totalRef = useRef(0)
  const timerRef = useRef<number | null>(null)
  const runningRef = useRef(false)

  const headerFor = (n: number): BlockHeader => ({ ...DEFAULT_HEADER, bits, time: DEFAULT_HEADER.time + n })

  const buildPreimage = (h: BlockHeader, n: number) =>
    `${h.version}${h.prevHash}${h.merkleRoot}${h.time}${h.bits.toString(16).padStart(8, '0')}${n.toString(16).padStart(8, '0')}`

  // 单次哈希（用于「单步」按钮）
  const doOneHash = async (n: number): Promise<{ hash: string; zeros: number }> => {
    const bytes = await sha256Bytes(buildPreimage(headerFor(n), n))
    const hash = bytesToHex(bytes)
    return { hash, zeros: leadingZeroBits(bytes) }
  }

  // 单步
  const step = async () => {
    if (found) return
    const n = nonce
    const { hash, zeros } = await doOneHash(n)
    setCurrentHash(hash)
    setCurrentZeros(zeros)
    setBestZeros((b) => Math.max(b, zeros))
    totalRef.current += 1
    setTotalHashes(totalRef.current)
    if (zeros >= bits) {
      setFound({ nonce: n, hash, tries: totalRef.current, ms: 0 })
      setMining(false)
      runningRef.current = false
    } else {
      setNonce(n + 1)
    }
  }

  // 连续挖矿：每批异步若干次，避免阻塞 UI
  useEffect(() => {
    if (!mining) {
      runningRef.current = false
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
      return
    }
    runningRef.current = true
    startRef.current = performance.now()
    if (!found) nonceRef.current = nonce

    const batch = async () => {
      if (!runningRef.current) return
      let n = nonceRef.current
      let best = bestZeros
      let count = 0
      const deadline = bits >= 7 ? 30 : 120 // 每批计算的次数
      for (let i = 0; i < deadline; i++) {
        const { hash, zeros } = await doOneHash(n)
        count++
        best = Math.max(best, zeros)
        if (zeros >= bits) {
          const ms = performance.now() - startRef.current
          setCurrentHash(hash)
          setCurrentZeros(zeros)
          setBestZeros(best)
          totalRef.current += count
          setTotalHashes(totalRef.current)
          setFound({ nonce: n, hash, tries: totalRef.current, ms })
          setMining(false)
          runningRef.current = false
          return
        }
        n++
      }
      nonceRef.current = n
      // 取最后一个哈希用于展示
      const { hash, zeros } = await doOneHash(n)
      setCurrentHash(hash)
      setCurrentZeros(zeros)
      setBestZeros(best)
      setNonce(n)
      totalRef.current += count
      setTotalHashes(totalRef.current)
      if (runningRef.current) timerRef.current = window.setTimeout(batch, 0)
    }
    batch()
    return () => { runningRef.current = false; if (timerRef.current) clearTimeout(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mining])

  const reset = () => {
    setMining(false)
    setFound(null)
    setNonce(0)
    nonceRef.current = 0
    setCurrentHash('')
    setCurrentZeros(0)
    setBestZeros(0)
    setTotalHashes(0)
    totalRef.current = 0
  }
  const changeBits = (b: number) => { reset(); setBits(b) }

  const targetDescription = `哈希值开头需要连续 ${bits} 个 0`

  return (
    <div className="space-y-5">
      <div className="panel p-4">
        <div className="mb-2 flex items-center gap-2">
          <Info size={15} className="text-btc-400" />
          <span className="text-sm font-semibold text-mist-100">什么是挖矿？</span>
        </div>
        <p className="text-xs leading-relaxed text-mist-300">
          挖矿就是不断更换区块头里的 <em className="not-italic text-btc-300">Nonce（随机数）</em>，对每个版本做 SHA-256 哈希，直到算出的哈希值小于网络目标值——在这个演示里，就是开头出现足够多的 0。
          这不是「解一道数学题」，而是靠海量反复尝试碰运气。
        </p>
      </div>

      {/* 难度控制 */}
      <div className="panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-mist-100"><Target size={15} className="text-ice-300" /> 难度设置</div>
          <span className="rounded-lg bg-ice-400/10 px-2.5 py-1 font-mono text-xs text-ice-300">{bits} 个前导零</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((b) => (
            <button
              key={b}
              onClick={() => changeBits(b)}
              className={`min-w-[44px] rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                bits === b ? 'border-btc-500 bg-btc-500/15 text-btc-300' : 'border-white/10 bg-white/4 text-mist-400 active:text-mist-100'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <div className="mt-2.5 text-[11px] text-mist-500">
          {targetDescription}。每多一个 0，平均需要多试约 16 倍的次数——这就是难度指数级增长的原因。
        </div>
      </div>

      {/* 实时状态 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="当前 Nonce" value={nonce.toLocaleString()} icon={<Hash size={13} />} />
        <Stat label="已尝试哈希" value={totalHashes.toLocaleString()} icon={<Zap size={13} />} />
        <Stat label="当前前导零" value={`${currentZeros} bit`} icon={<Target size={13} />} />
        <Stat label="最佳记录" value={`${bestZeros} bit`} icon={<Pickaxe size={13} />} tone="btc" />
      </div>

      {/* 哈希展示 */}
      <div className="panel p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-mist-300">当前区块头哈希（真实 SHA-256）</span>
          {currentHash && <span className={`font-mono ${currentZeros >= bits ? 'text-emerald-300' : 'text-mist-500'}`}>{currentZeros}/{bits} 前导零</span>}
        </div>
        <div className="code-block relative overflow-hidden p-3 font-mono text-[11px] leading-relaxed">
          {currentHash ? (
            <>
              <span className="text-emerald-300">{currentHash.slice(0, currentZeros)}</span>
              <span className="text-rose-300">{currentHash[currentZeros]}</span>
              <span className="text-mist-500">{currentHash.slice(currentZeros + 1)}</span>
            </>
          ) : (
            <span className="text-mist-600">点击「单步」或「开始挖矿」生成哈希…</span>
          )}
        </div>
        <div className="mt-1.5 text-[10px] leading-relaxed text-mist-500">
          绿色部分 = 已达成的连续前导零；红色 = 第一个不满足的字符（非 0）。挖矿目标就是让红色字符也变成 0。
        </div>
      </div>

      {/* 成功提示 */}
      {found && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/8 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300"><Pickaxe size={16} /> 找到有效区块！</div>
          <div className="mt-2 space-y-1 font-mono text-[11px] text-emerald-200/90">
            <div>Nonce = {found.nonce}</div>
            <div>哈希 = {found.hash}</div>
            <div>尝试次数 = {found.tries.toLocaleString()} · 耗时 ≈ {found.ms.toFixed(0)} ms</div>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-emerald-200/70">
            「挖到」后，这个区块会被广播全网，其他节点独立验证哈希确实满足条件，然后接受它。区块 reward（当前约 3.125 BTC）会支付给找到它的矿工。
          </p>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="flex gap-2">
        {!found && (
          <>
            <button onClick={step} disabled={mining} className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-medium text-mist-200 disabled:opacity-40">
              单步尝试
            </button>
            <button
              onClick={() => setMining((m) => !m)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-btc-600 to-btc-500 py-3 text-sm font-semibold text-white shadow-glow-btc"
            >
              {mining ? <><Pause size={16} /> 暂停</> : <><Play size={16} /> 开始挖矿</>}
            </button>
          </>
        )}
        <button onClick={reset} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-mist-300">
          <RotateCcw size={15} /> 重置
        </button>
      </div>

      <div className="rounded-xl border border-ice-400/20 bg-ice-400/5 p-3 text-[11px] leading-relaxed text-ice-200/80">
        <strong className="text-ice-200">与真实网络的差距：</strong>真实比特币网络在 2026 年的难度要求哈希前导约 60+ 个 0（约 2⁶⁰ 分之一概率），全网算力每秒执行约数百 EH/s（10¹⁸ 次哈希）。这里的 1–6 个 0 只是让你在手机上手感受「尝试—失败—再尝试」的过程。真实网络还包含区块头版本、难度目标位压缩编码、时间戳调整与矿池协作等机制，本演示做了简化。
      </div>
    </div>
  )
}

function Stat({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone?: 'btc' }) {
  return (
    <div className="panel-flat p-3">
      <div className={`mb-1 flex items-center gap-1.5 text-[10px] ${tone === 'btc' ? 'text-btc-400' : 'text-mist-500'}`}>{icon}{label}</div>
      <div className="truncate font-mono text-sm font-semibold text-mist-100 tabular-nums">{value}</div>
    </div>
  )
}
