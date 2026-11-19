// ===== 课程体系结构 =====

/** 术语（中英对照） */
export interface Term {
  zh: string
  en: string
  note?: string
}

/** 正文内容块（富文本片段，避免在组件里塞大段 HTML） */
export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'callout'; tone: 'info' | 'warn' | 'key' | 'risk'; title: string; text: string }
  | { type: 'code'; text: string; caption?: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'compare'; title: string; left: { label: string; points: string[] }; right: { label: string; points: string[] } }

/** 一节课的完整内容 */
export interface Lesson {
  id: string // 全局唯一，如 "02-03"
  moduleId: string // 所属模块 id，如 "02"
  order: number // 模块内序号
  title: string
  subtitle?: string
  estMinutes: number
  /** 学完你能（可观测目标） */
  objectives: string[]
  /** 核心问题（导入） */
  coreQuestion: string
  /** 本章导读：研究的问题、学习目的与知识背景 */
  intro?: string

  /** 零基础插叙：术语表 */
  terms: Term[]
  /** 知识讲解正文 */
  content: ContentBlock[]
  /** 原理图解：用文字+结构描述的图示（由 VizDiagram 渲染） */
  diagram?: DiagramSpec
  /** 多张原理图 / 运行流程图（优先于 diagram） */
  diagrams?: DiagramSpec[]
  /** 实例演示：用具体数据逐步走一遍 */
  workedExample?: WorkedExample
  /** 技术分析：设计优势、局限与安全性 */
  analysis?: AnalysisPoint[]
  /** 常见误区（不少于 3 条） */
  misconceptions?: Misconception[]

  /** 关联互动实验 id */
  labId?: string
  /** 重点总结 */
  keyPoints: string[]
  /** 随堂测试题号（指向 questions/{moduleId}.ts 的题 id） */
  quizIds: string[]
  /** 延伸阅读 */
  furtherReading: { title: string; url?: string; note?: string }[]
  /** 资料日期标注 */
  asOf?: string
}

/** 实例演示：场景 + 分步推演 + 结论 */
export interface WorkedExample {
  title: string
  /** 场景设定（谁、多少、为什么） */
  setup: string
  /** 分步推演 */
  steps: { label: string; detail: string }[]
  /** 可选数据表（字节布局、字段清单等） */
  table?: { headers: string[]; rows: string[][] }
  /** 可选命令 / 代码示例 */
  code?: { text: string; caption?: string }
  /** 结论：这个例子说明了什么 */
  conclusion: string
}

/** 技术分析条目 */
export interface AnalysisPoint {
  label: string
  /** pro=设计优势 con=局限 risk=安全边界 */
  tone: 'pro' | 'con' | 'risk'
  text: string
}

/** 常见误区：错误理解 vs 正确理解 */
export interface Misconception {
  wrong: string
  right: string
}

/** 结构化图示描述 */
export interface DiagramSpec {
  kind: 'flow' | 'layers' | 'cycle' | 'tree' | 'chain' | 'merkle'
  title: string
  nodes: { id: string; label: string; sub?: string; tone?: 'btc' | 'ice' | 'plain' }[]
  /** flow/cycle: [from,to]; layers/tree: 层级分组 */
  edges?: [string, string][]
  groups?: { label: string; nodeIds: string[] }[]
  caption?: string
}

/** 模块（篇章） */
export interface Module {
  id: string // "01".."10"
  order: number
  title: string
  subtitle: string
  icon: string // lucide icon 名
  color: 'btc' | 'ice' | 'violet' | 'teal' | 'rose' | 'amber' | 'sky' | 'emerald' | 'indigo' | 'fuchsia'
  description: string
  lessonIds: string[]
}

/** 题库：题型 */
export type QuestionType = 'single' | 'multiple' | 'boolean' | 'concept' | 'scenario'

/** 一道题 */
export interface Question {
  id: string
  moduleId: string
  lessonId?: string
  type: QuestionType
  stem: string
  options?: string[]
  /** single/multiple: 正确选项索引；boolean: 0=对 1=错；concept/scenario: 判分要点组 */
  answer?: number | number[]
  /** 简答/场景题：每组是同义要点数组，命中组数/总组数 >= 阈值判对 */
  keywords?: string[][]
  /** 判分阈值（0-1），默认 0.7 */
  threshold?: number
  /** 简要解析（判分后立即展示） */
  explanation: string
  /** 详细推导：分步演算、数据代入、验证过程 */
  derivation?: string
  /** 易错提醒 */
  pitfalls?: string
  /** 考查知识点标签（用于掌握度统计与复习） */
  tags: string[]
  difficulty: 1 | 2 | 3
}

/** 知识地图节点 */
export interface MapNode {
  id: string
  label: string
  moduleId: string
  /** 点击跳转目标：课程 id 或实验 id */
  target: { kind: 'lesson' | 'lab'; id: string }
  x: number // 0-100 百分比布局
  y: number
  tone?: 'btc' | 'ice' | 'plain'
}

export interface MapEdge {
  from: string
  to: string
  label?: string
}

// ===== 学习记录与进度 =====

export interface LessonProgress {
  lessonId: string
  /** 已读完（标记学完） */
  completed: boolean
  /** 阅读到的内容块索引 */
  readBlock: number
  lastReadAt: number
}

export interface AnswerRecord {
  questionId: string
  correct: boolean
  userAnswer: string
  at: number
  /** 错题重做后是否已移出错题本 */
  resolved: boolean
}

export interface Note {
  id: string
  lessonId: string
  text: string
  at: number
}

/** 间隔复习条目 */
export interface ReviewItem {
  key: string // 知识点标签或题目 id
  kind: 'tag' | 'question'
  /** 下次复习时间 */
  dueAt: number
  /** 复习间隔（天） */
  interval: number
  /** 连续答对次数 */
  streak: number
}

export interface LearningState {
  version: number
  lessonProgress: Record<string, LessonProgress>
  answers: Record<string, AnswerRecord>
  notes: Note[]
  favorites: string[] // 收藏的课程/知识点 id
  reviews: Record<string, ReviewItem> // key -> 复习条目
  /** 每日学习记录 YYYY-MM-DD -> 学习分钟数/活动数 */
  dailyActivity: Record<string, number>
  /** 连续学习天数（缓存，按 dailyActivity 计算） */
  labResults: Record<string, { at: number; score?: number }>
  createdAt: number
  updatedAt: number
}

// ===== 导航 =====

export type TabKey = 'home' | 'courses' | 'labs' | 'knowledge' | 'profile'
