import { Home, BookOpen, FlaskConical, Network, UserRound } from 'lucide-react'
import type { TabKey } from '../../types'

const TABS: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'courses', label: '课程', icon: BookOpen },
  { key: 'labs', label: '实验室', icon: FlaskConical },
  { key: 'knowledge', label: '知识库', icon: Network },
  { key: 'profile', label: '我的', icon: UserRound },
]

export function BottomNav({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-900/92 backdrop-blur-xl safe-bottom md:hidden">
      <div className="grid grid-cols-5">
        {TABS.map(({ key, label, icon: Icon }) => {
          const on = active === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`relative flex min-h-[58px] flex-col items-center justify-center gap-1 tap-target transition-colors ${on ? 'text-btc-400' : 'text-mist-500 active:text-mist-200'}`}
              aria-label={label}
            >
              {on && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-btc-500 shadow-glow-btc" />}
              <Icon size={21} strokeWidth={on ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export { TABS }
