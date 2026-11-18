import type { Lesson, Question, Module, MapNode, MapEdge } from '../types'
import { MODULES } from './modules'
import { module01 } from './lessons/module01'
import { module02 } from './lessons/module02'
import { module03 } from './lessons/module03'
import { module04 } from './lessons/module04'
import { module05 } from './lessons/module05'
import { module06 } from './lessons/module06'
import { module07 } from './lessons/module07'
import { module08 } from './lessons/module08'
import { module09 } from './lessons/module09'
import { module10 } from './lessons/module10'
import { questions01 } from './questions/module01'
import { questions02 } from './questions/module02'
import { questions03 } from './questions/module03'
import { questions04 } from './questions/module04'
import { questions05 } from './questions/module05'
import { questions06 } from './questions/module06'
import { questions07 } from './questions/module07'
import { questions08 } from './questions/module08'
import { questions09 } from './questions/module09'
import { questions10 } from './questions/module10'
import { KNOWLEDGE_NODES, KNOWLEDGE_EDGES, LEARNING_PATH } from './knowledgeMap'

export const modules: Module[] = MODULES
export const lessons: Lesson[] = [
  ...module01, ...module02, ...module03, ...module04, ...module05,
  ...module06, ...module07, ...module08, ...module09, ...module10,
]
export const questions: Question[] = [
  ...questions01, ...questions02, ...questions03, ...questions04, ...questions05,
  ...questions06, ...questions07, ...questions08, ...questions09, ...questions10,
]
export const mapNodes: MapNode[] = KNOWLEDGE_NODES
export const mapEdges: MapEdge[] = KNOWLEDGE_EDGES
export { LEARNING_PATH }

// 索引
export const lessonById = new Map(lessons.map((l) => [l.id, l]))
export const questionById = new Map(questions.map((q) => [q.id, q]))
export const moduleById = new Map(modules.map((m) => [m.id, m]))
export const questionsByModule = (moduleId: string) => questions.filter((q) => q.moduleId === moduleId)
export const lessonsByModule = (moduleId: string) => lessons.filter((l) => l.moduleId === moduleId)
