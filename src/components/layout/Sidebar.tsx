import { Bitcoin, Home, BookOpen, FlaskConical, Network, UserRound } from 'lucide-react'
import type { TabKey } from '../../types'
import { TABS } from './BottomNav'

const ICONS: Record<TabKey, typeof Home> = {
  home: Home,
  courses: BookOpen,
  labs: FlaskConical,
  knowledge: Network,
  profile: UserRound,
}

export function Sidebar({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-white/10 bg-ink-900/80 backdrop-blur-xl md:flex">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-btc-500 to-btc-700 shadow-glow-btc">
          <Bitcoin size={22} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-mist-100">Bitcoin Academy</div>
          <div className="text-[10px] tracking-wider text-mist-500">比特币学院</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-5">
        {TABS.map(({ key, label }) => {
          const Icon = ICONS[key]
          const on = active === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                on ? 'bg-btc-500/12 font-medium text-btc-300' : 'text-mist-400 hover:bg-white/5 hover:text-mist-100'
              }`}
            >
              <Icon size={19} strokeWidth={on ? 2.2 : 1.8} />
              {label}
            </button>
          )
        })}
      </nav>
      <div className="border-t border-white/10 px-6 py-4 text-[10px] leading-relaxed text-mist-600">
        基于《精通比特币》第三版重组<br />v1.0 · 知识截至 2026-11
      </div>
    </aside>
  )
}
