import { useEffect, useState } from 'react'
import { LearningProvider } from './store/LearningStore'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './pages/HomePage'
import { CoursesPage } from './pages/CoursesPage'
import { LessonPage } from './pages/LessonPage'
import { LabsPage } from './pages/LabsPage'
import { KnowledgeMapPage } from './pages/KnowledgeMapPage'
import { ProfilePage } from './pages/ProfilePage'
import type { TabKey } from './types'

type Route = { tab: TabKey; lessonId?: string; labId?: string }

function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '')
  if (h.startsWith('lesson/')) return { tab: 'courses', lessonId: h.slice(7) }
  if (h.startsWith('lab/')) return { tab: 'labs', labId: h.slice(4) }
  if (['home', 'courses', 'labs', 'knowledge', 'profile'].includes(h)) return { tab: h as TabKey }
  return { tab: 'home' }
}

function AppInner() {
  const [route, setRoute] = useState<Route>(parseHash)

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const goTab = (tab: TabKey) => {
    window.location.hash = `/${tab}`
    setRoute({ tab })
  }
  const openLesson = (lessonId: string) => {
    window.location.hash = `/lesson/${lessonId}`
    setRoute({ tab: 'courses', lessonId })
  }
  const openLab = (labId: string) => {
    window.location.hash = `/lab/${labId}`
    setRoute({ tab: 'labs', labId })
  }
  const backToCourses = () => {
    window.location.hash = '/courses'
    setRoute({ tab: 'courses' })
  }

  // 注册 Service Worker（PWA 离线缓存）
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const base = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/'
      navigator.serviceWorker.register(`${base}sw.js`).catch(() => { /* 忽略注册失败 */ })
    }
  }, [])

  let content: React.ReactNode
  if (route.lessonId) {
    content = <LessonPage
      lessonId={route.lessonId}
      onBack={backToCourses}
      onNavigateLab={openLab}
      onNavigate={(tab) => goTab(tab)}
    />
  } else if (route.labId) {
    content = <LabsPage key={route.labId} initialLab={route.labId} />
  } else {
    switch (route.tab) {
      case 'courses': content = <CoursesPage openLesson={route.lessonId} />; break
      case 'labs': content = <LabsPage />; break
      case 'knowledge': content = <KnowledgeMapPage onOpenLesson={openLesson} onOpenLab={openLab} />; break
      case 'profile': content = <ProfilePage onOpenLesson={openLesson} />; break
      default: content = <HomePage onNavigate={(tab, lessonId) => lessonId ? openLesson(lessonId) : goTab(tab)} />
    }
  }

  return (
    <AppShell tab={route.tab} onTab={goTab}>
      {content}
    </AppShell>
  )
}

export default function App() {
  return <LearningProvider><AppInner /></LearningProvider>
}
