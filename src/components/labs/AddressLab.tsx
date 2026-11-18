import { useEffect, useState } from 'react'
import { MapPin, RefreshCw, ArrowDown, Hash, AlertTriangle } from 'lucide-react'
import { randomHex } from '../../utils/crypto'
import { privateToPublic, publicToAddress } from '../../utils/bitcoinCrypto'
import { shorten } from '../../utils/format'

/**
 * 比特币地址生成原理演示器 —— 真实算法
 * 完整链路：私钥 → 公钥 → SHA256 → RIPEMD160 → 加版本字节 → 双重SHA256校验和 → Base58Check → 地址
 */
export function AddressLab() {
  const [priv, setPriv] = useState(() => randomHex(32))
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    const pub = privateToPublic(priv)
    publicToAddress(pub.compressed).then((addr) => {
      if (!alive) return
      setAddress(addr)
      setLoading(false)
    })
    return () => { alive = false }
  }, [priv])

  const pub = privateToPublic(priv)
  const regenerate = () => setPriv(randomHex(32))

  const steps = [
    { n: 1, title: '私钥', desc: '256 位随机数', value: shorten(priv, 12, 8), tone: 'rose' as const },
    { n: 2, title: '公钥', desc: 'secp256k1 推导', value: shorten(pub.compressed, 12, 8), tone: 'emerald' as const },
    { n: 3, title: 'HASH160', desc: 'SHA256 后再 RIPEMD160，得 20 字节', value: '160 bit 指纹', tone: 'ice' as const },
    { n: 4, title: '版本字节', desc: '主网 P2PKH 前缀 0x00', value: '0x00 + hash160', tone: 'plain' as const },
    { n: 5, title: '校验和', desc: '取双重 SHA256 的前 4 字节', value: '4 byte checksum', tone: 'plain' as const },
    { n: 6, title: 'Base58Check', desc: '编码后得到地址', value: loading ? '计算中…' : shorten(address, 12, 8), tone: 'btc' as const },
  ]

  const toneClass: Record<string, string> = {
    rose: 'border-rose-400/30 text-rose-300',
    emerald: 'border-emerald-400/30 text-emerald-300',
    ice: 'border-ice-400/30 text-ice-300',
    btc: 'border-btc-500/40 text-btc-300',
    plain: 'border-white/12 text-mist-200',
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-400/25 bg-amber-400/6 p-3 text-[11px] leading-relaxed text-amber-200/85">
        <div className="mb-1 flex items-center gap-1.5 font-semibold text-amber-300"><AlertTriangle size={13} /> 仅供学习</div>
        密钥在浏览器本地生成，不上传、不保存。请勿在此输入真实私钥，也不要使用此处生成的地址接收真实资金。
      </div>

      <div className="panel p-4">
        <div className="mb-2 flex items-center gap-2">
          <MapPin size={15} className="text-btc-400" />
          <span className="text-sm font-semibold text-mist-100">地址是怎么来的？</span>
          <span className="ml-auto rounded bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">真实算法</span>
        </div>
        <p className="text-xs leading-relaxed text-mist-300">
          最常见的比特币地址（<code>1</code> 开头）是公钥经过 HASH160 和 Base58Check 编码的结果。它没有包含任何个人信息，只是密钥派生链上的最后一环。
        </p>
      </div>

      {/* 生成结果 */}
      <div className="panel p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-mist-300">生成的 P2PKH 地址（主网）</span>
          <button onClick={regenerate} className="flex items-center gap-1 text-[11px] text-ice-300"><RefreshCw size={12} /> 换一个</button>
        </div>
        <div className="code-block break-all p-3 font-mono text-xs text-btc-300">{address || '计算中…'}</div>
        <div className="mt-1.5 text-[10px] text-mist-500">以 1 开头 = 主网 P2PKH（传统）地址。同一私钥还对应其他地址类型（如 SegWit 的 bc1 开头），此处仅演示传统类型。</div>
      </div>

      {/* 推导步骤 */}
      <div className="panel p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-mist-100"><Hash size={15} className="text-ice-300" /> 六步推导链</div>
        <div className="space-y-1">
          {steps.map((s, i) => (
            <div key={s.n}>
              <div className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${toneClass[s.tone]}`}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-black/25 font-mono text-[11px]">{s.n}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold">{s.title} <span className="ml-1 font-normal opacity-70">· {s.desc}</span></div>
                  <div className="truncate font-mono text-[10px] opacity-80">{s.value}</div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-1"><ArrowDown size={14} className="text-mist-600" /></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/3 p-3 text-[11px] leading-relaxed text-mist-400">
        <strong className="text-mist-200">关键理解：</strong>地址不是钱包的「账号」，而是交易的收款脚本模板。钱包真正的资产控制权来自私钥。地址可以随意公开，但私钥一旦泄露，资产就可能被人转走。此演示的 SHA-256 使用浏览器原生实现，椭圆曲线与 HASH160/Base58Check 均已通过官方测试向量校验。
      </div>
    </div>
  )
}
