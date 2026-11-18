import type { ReactNode } from 'react'
import type { Module } from '../../types'

/** 模块主题色映射 */
export const moduleColor: Record<Module['color'], { text: string; border: string; bg: string; dot: string }> = {
  btc: { text: 'text-btc-400', border: 'border-btc-500/40', bg: 'bg-btc-500/10', dot: '#f7931a' },
  ice: { text: 'text-ice-300', border: 'border-ice-400/40', bg: 'bg-ice-400/10', dot: '#5fa8ff' },
  violet: { text: 'text-violet-300', border: 'border-violet-400/40', bg: 'bg-violet-400/10', dot: '#a78bfa' },
  teal: { text: 'text-teal-300', border: 'border-teal-400/40', bg: 'bg-teal-400/10', dot: '#2dd4bf' },
  rose: { text: 'text-rose-300', border: 'border-rose-400/40', bg: 'bg-rose-400/10', dot: '#fb7185' },
  amber: { text: 'text-amber-300', border: 'border-amber-400/40', bg: 'bg-amber-400/10', dot: '#fbbf24' },
  sky: { text: 'text-sky-300', border: 'border-sky-400/40', bg: 'bg-sky-400/10', dot: '#38bdf8' },
  emerald: { text: 'text-emerald-300', border: 'border-emerald-400/40', bg: 'bg-emerald-400/10', dot: '#34d399' },
  indigo: { text: 'text-indigo-300', border: 'border-indigo-400/40', bg: 'bg-indigo-400/10', dot: '#818cf8' },
  fuchsia: { text: 'text-fuchsia-300', border: 'border-fuchsia-400/40', bg: 'bg-fuchsia-400/10', dot: '#e879f9' },
}

export function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        {eyebrow && <div className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-mist-500 uppercase">{eyebrow}</div>}
        <h2 className="text-lg font-semibold text-mist-100">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function Pill({ children, tone = 'plain' }: { children: ReactNode; tone?: 'btc' | 'ice' | 'plain' | 'good' | 'bad' }) {
  const tones: Record<string, string> = {
    btc: 'bg-btc-500/12 text-btc-300 border-btc-500/25',
    ice: 'bg-ice-400/12 text-ice-300 border-ice-400/25',
    plain: 'bg-white/5 text-mist-300 border-white/10',
    good: 'bg-emerald-400/12 text-emerald-300 border-emerald-400/25',
    bad: 'bg-rose-400/12 text-rose-300 border-rose-400/25',
  }
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}>{children}</span>
}

export function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon?: ReactNode }) {
  return (
    <div className="panel-flat p-3.5">
      <div className="flex items-center gap-2 text-mist-500">
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <div className="mt-1.5 text-2xl font-semibold text-mist-100 tabular-nums">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-mist-400">{sub}</div>}
    </div>
  )
}

export function ProgressBar({ value, tone = 'btc' }: { value: number; tone?: 'btc' | 'ice' }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
      <div
        className={`h-full rounded-full transition-all duration-500 ${tone === 'btc' ? 'bg-gradient-to-r from-btc-600 to-btc-400' : 'bg-gradient-to-r from-ice-500 to-ice-300'}`}
        style={{ width: `${v}%` }}
      />
    </div>
  )
}

export function EmptyState({ icon, title, text, action }: { icon?: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
      {icon && <div className="mb-3 text-mist-500">{icon}</div>}
      <div className="text-sm font-medium text-mist-200">{title}</div>
      <div className="mt-1 max-w-xs text-xs leading-relaxed text-mist-500">{text}</div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
