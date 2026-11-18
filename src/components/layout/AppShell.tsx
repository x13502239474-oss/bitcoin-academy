import type { ReactNode } from 'react'
import { Bitcoin } from 'lucide-react'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import type { TabKey } from '../../types'

const TITLES: Record<TabKey, { title: string; sub: string }> = {
  home: { title: 'Bitcoin Academy', sub: '比特币学院' },
  courses: { title: '课程体系', sub: '从零到系统的十个模块' },
  labs: { title: '互动实验室', sub: '亲手操作，真正理解' },
  knowledge: { title: '知识地图', sub: '知识点如何连成体系' },
  profile: { title: '我的学习', sub: '进度 · 错题 · 笔记' },
}

export function AppShell({ tab, onTab, children }: { tab: TabKey; onTab: (t: TabKey) => void; children: ReactNode }) {
  const t = TITLES[tab]
  return (
    <div className="min-h-screen bg-ink-950 bg-grid">
      <Sidebar active={tab} onChange={onTab} />

      <div className="md:pl-60">
        {/* 移动端顶栏 */}
        <header className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-white/8 bg-ink-950/85 px-4 py-3 backdrop-blur-xl md:hidden safe-top">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-btc-500 to-btc-700">
            <Bitcoin size={19} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-mist-100">{t.title}</div>
            <div className="truncate text-[10px] text-mist-500">{t.sub}</div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-4 md:pb-16 md:pt-8">{children}</main>
      </div>

      <BottomNav active={tab} onChange={onTab} />
    </div>
  )
}
