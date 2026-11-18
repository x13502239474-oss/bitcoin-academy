import { useEffect, useState } from 'react'
import { ArrowLeft, FlaskConical, Hash, KeyRound, MapPin, ArrowLeftRight, Link2, Pickaxe, ShieldCheck } from 'lucide-react'
import { LAB_LIST } from '../components/labs/registry'
import { HashLab } from '../components/labs/HashLab'
import { KeyPairLab } from '../components/labs/KeyPairLab'
import { AddressLab } from '../components/labs/AddressLab'
import { UTXOLab } from '../components/labs/UTXOLab'
import { BlockchainLab } from '../components/labs/BlockchainLab'
import { MiningLab } from '../components/labs/MiningLab'
import { useLearning } from '../store/LearningStore'

const ICONS: Record<string, typeof Hash> = { Hash, KeyRound, MapPin, ArrowLeftRight, Link2, Pickaxe }
const TONE: Record<string, string> = {
  btc: 'border-btc-500/30 bg-btc-500/8 text-btc-300',
  ice: 'border-ice-400/30 bg-ice-400/8 text-ice-300',
  violet: 'border-violet-400/30 bg-violet-400/8 text-violet-300',
  teal: 'border-teal-400/30 bg-teal-400/8 text-teal-300',
  rose: 'border-rose-400/30 bg-rose-400/8 text-rose-300',
  emerald: 'border-emerald-400/30 bg-emerald-400/8 text-emerald-300',
}

export function LabsPage({ initialLab }: { initialLab?: string }) {
  const [active, setActive] = useState<string | null>(initialLab ?? null)
  const { dispatch } = useLearning()

  if (active) {
    const meta = LAB_LIST.find((l) => l.id === active)
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => setActive(null)} className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-mist-300"><ArrowLeft size={14} /> 返回实验室列表</button>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-mist-100">{meta?.title}</h1>
          <span className={`rounded px-2 py-0.5 text-[10px] ${meta?.real ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}>
            {meta?.real ? '真实算法' : '教学模拟'}
          </span>
        </div>
        <LabComponent id={active} onVisit={() => dispatch({ type: 'LAB_RESULT', labId: active })} />
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="rounded-xl border border-btc-500/20 bg-btc-500/5 p-3.5 text-xs leading-relaxed text-mist-300">
        六个可亲手操作的工具。密码学类使用<strong className="text-emerald-300">真实算法</strong>（浏览器 Web Crypto 与经校验的 secp256k1 实现）；交易与区块链结构为<strong className="text-amber-300">教学模拟</strong>，明确标注简化之处。
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {LAB_LIST.map((lab) => {
          const Icon = ICONS[lab.icon] ?? FlaskConical
          return (
            <button key={lab.id} onClick={() => setActive(lab.id)} className={`panel flex flex-col items-start gap-2.5 p-4 text-left transition-transform active:scale-[0.98] ${TONE[lab.tone]}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${TONE[lab.tone]}`}><Icon size={19} /></div>
              <div>
                <div className="text-sm font-semibold text-mist-100">{lab.title}</div>
                <div className="mt-1 text-[11px] leading-relaxed text-mist-500">{lab.desc}</div>
              </div>
              <div className="mt-auto flex w-full items-center justify-between pt-1">
                <span className="text-[10px] text-mist-600">模块 {lab.moduleId}</span>
                <span className={`rounded px-1.5 py-0.5 text-[9px] ${lab.real ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}>{lab.real ? '真实' : '模拟'}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-white/8 bg-white/3 p-3 text-[11px] leading-relaxed text-mist-400">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-400" />
        <span>所有密钥均在浏览器本地生成，不上传、不保存。请勿在此输入真实私钥或助记词。</span>
      </div>
    </div>
  )
}

function LabComponent({ id, onVisit }: { id: string; onVisit: () => void }) {
  useEffect(() => { onVisit() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      {id === 'hash' && <HashLab />}
      {id === 'keypair' && <KeyPairLab />}
      {id === 'address' && <AddressLab />}
      {id === 'utxo' && <UTXOLab />}
      {id === 'blockchain' && <BlockchainLab />}
      {id === 'mining' && <MiningLab />}
    </>
  )
}
