import { useMemo, useState } from 'react'
import { KeyRound, RefreshCw, ArrowRight, LockKeyhole, UnlockKeyhole, ShieldCheck, AlertTriangle } from 'lucide-react'
import { randomHex } from '../../utils/crypto'
import { privateToPublic } from '../../utils/bitcoinCrypto'

/**
 * 公钥与私钥关系演示器 —— 真实 secp256k1
 * 演示：私钥 → 公钥是单向的；知道公钥无法反推私钥
 * 安全：所有密钥均为浏览器本地随机生成的演示密钥，不涉及任何真实资金
 */
export function KeyPairLab() {
  const [priv, setPriv] = useState(() => randomHex(32))

  const pub = useMemo(() => {
    try { return privateToPublic(priv) } catch { return null }
  }, [priv])

  const regenerate = () => setPriv(randomHex(32))

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-400/25 bg-amber-400/6 p-3 text-[11px] leading-relaxed text-amber-200/85">
        <div className="mb-1 flex items-center gap-1.5 font-semibold text-amber-300"><AlertTriangle size={13} /> 安全第一</div>
        这里生成的密钥仅供学习演示，由浏览器本地随机数生成，<strong>不会上传、不会保存</strong>。请勿将此处生成的任何密钥用于真实资产，也不要在此输入你真实的私钥或助记词。
      </div>

      <div className="panel p-4">
        <div className="mb-2 flex items-center gap-2">
          <KeyRound size={15} className="text-btc-400" />
          <span className="text-sm font-semibold text-mist-100">私钥 → 公钥（单向推导）</span>
          <span className="ml-auto rounded bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">真实 secp256k1</span>
        </div>
        <p className="text-xs leading-relaxed text-mist-300">
          私钥是一个 256 位随机数。通过椭圆曲线乘法 <code>公钥 = 私钥 × G</code> 可以得到公钥，其中 G 是固定的生成元点。
          这个运算<em className="not-italic text-btc-300">单向</em>：正向很快，反向（从公钥求私钥）在计算上不可行。
        </p>
      </div>

      {/* 私钥 */}
      <div className="panel p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-300"><LockKeyhole size={14} /> 私钥 Private Key</div>
          <button onClick={regenerate} className="flex items-center gap-1 text-[11px] text-ice-300"><RefreshCw size={12} /> 换一个</button>
        </div>
        <div className="code-block break-all p-3 font-mono text-[11px] text-rose-300">{priv}</div>
        <div className="mt-1.5 text-[10px] text-mist-500">256 bit · 64 位十六进制。这是资金控制权的根本，绝不泄露。</div>
      </div>

      {/* 推导箭头 */}
      <div className="flex items-center justify-center gap-3 py-1">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-btc-500/40" />
        <div className="flex items-center gap-2 rounded-full border border-btc-500/30 bg-btc-500/10 px-3 py-1.5 text-[11px] text-btc-300">
          椭圆曲线乘法 <ArrowRight size={13} />
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-btc-500/40" />
      </div>

      {/* 公钥 */}
      {pub && (
        <div className="panel p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-300"><UnlockKeyhole size={14} /> 公钥 Public Key</div>
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-[10px] text-mist-500">压缩格式（33 字节，02/03 开头）</div>
              <div className="code-block break-all p-3 font-mono text-[11px] text-emerald-300">{pub.compressed}</div>
            </div>
            <div>
              <div className="mb-1 text-[10px] text-mist-500">坐标 X</div>
              <div className="code-block break-all p-2.5 font-mono text-[10px] text-mist-400">{pub.x}</div>
            </div>
            <div>
              <div className="mb-1 text-[10px] text-mist-500">坐标 Y</div>
              <div className="code-block break-all p-2.5 font-mono text-[10px] text-mist-400">{pub.y}</div>
            </div>
          </div>
        </div>
      )}

      {/* 单向性说明 */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="panel-flat p-3.5">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-mist-100"><ShieldCheck size={14} className="text-emerald-400" /> 正向：私钥 → 公钥</div>
          <p className="text-[11px] leading-relaxed text-mist-400">毫秒级完成。你的钱包每次需要生成地址时都在做这件事。</p>
        </div>
        <div className="panel-flat p-3.5">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-mist-100"><LockKeyhole size={14} className="text-rose-400" /> 反向：公钥 → 私钥</div>
          <p className="text-[11px] leading-relaxed text-mist-400">需要约 2²⁵⁶ 次尝试。以现有算力，宇宙寿命内也无法完成。</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/3 p-3 text-[11px] leading-relaxed text-mist-400">
        <strong className="text-mist-200">演示真实性：</strong>本演示的椭圆曲线运算是真实的 secp256k1 实现（与比特币一致），并已通过官方测试向量校验（私钥 1 → 公钥 0279be66…）。请理解：公钥可以公开，私钥必须保密；地址由公钥进一步推导而来。
      </div>
    </div>
  )
}
