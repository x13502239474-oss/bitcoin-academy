import type { Question } from '../types'

/**
 * 判分引擎
 * 四种题型判分语义：
 * - single: 单选字母/索引比对
 * - multiple: 多选集合比对
 * - boolean: 宽口径识别（对/正确/√/true 等）
 * - concept/scenario: 判分要点组，命中组数/总组数 >= threshold 判对
 */

/** 文本归一化：去空格标点、全角转半角、小写 */
export function normalize(text: string): string {
  return text
    .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)) // 全角转半角
    .replace(/[\s,，。.、;；:：!！?？'"『』「」()（）]/g, '')
    .toLowerCase()
}

/** 判断题：宽口径识别用户答案是否为「对」 */
function isTrue(text: string): boolean | null {
  const n = normalize(text)
  if (!n) return null
  const trueWords = ['对', '正确', '是', 'yes', 'true', '√', 't', '1', '对的', '正确']
  const falseWords = ['错', '错误', '否', 'no', 'false', '×', 'f', '0', '不对', '错的']
  if (trueWords.some((w) => n === normalize(w) || n.includes(normalize(w)))) return true
  if (falseWords.some((w) => n === normalize(w) || n.includes(normalize(w)))) return false
  // 单字符兜底
  if (n.startsWith('对') || n.startsWith('√')) return true
  if (n.startsWith('错') || n.startsWith('×')) return false
  return null
}

export interface GradeResult {
  correct: boolean
  /** 命中的要点组索引（用于错题反馈） */
  hitGroups?: number[]
  /** 未覆盖的要点提示 */
  missing?: string[]
  score: number // 0-1
}

/** 对「要点组题」判分：返回命中详情 */
export function gradeKeywords(answer: string, question: Question): GradeResult {
  const groups = question.keywords ?? []
  if (groups.length === 0) return { correct: false, score: 0 }
  const text = normalize(answer)
  const hitGroups: number[] = []
  const missing: string[] = []
  groups.forEach((synonyms, i) => {
    const hit = synonyms.some((kw) => {
      const nk = normalize(kw)
      return nk.length > 0 && text.includes(nk)
    })
    if (hit) hitGroups.push(i)
    else missing.push(synonyms[0])
  })
  const score = hitGroups.length / groups.length
  const threshold = question.threshold ?? 0.7
  return { correct: score >= threshold, score, hitGroups, missing }
}

/** 统一判分入口 */
export function grade(answer: string | number | number[], question: Question): GradeResult {
  switch (question.type) {
    case 'single': {
      const a = typeof answer === 'number' ? answer : parseInt(String(answer), 10)
      const correct = a === question.answer
      return { correct, score: correct ? 1 : 0 }
    }
    case 'multiple': {
      const a = Array.isArray(answer) ? answer : []
      const expected = (question.answer as number[]) ?? []
      const sortedA = [...a].sort((x, y) => x - y)
      const sortedE = [...expected].sort((x, y) => x - y)
      const correct = sortedA.length === sortedE.length && sortedA.every((v, i) => v === sortedE[i])
      return { correct, score: correct ? 1 : 0 }
    }
    case 'boolean': {
      const userBool = typeof answer === 'number'
        ? answer === 0
        : isTrue(String(answer))
      if (userBool === null) return { correct: false, score: 0 }
      // answer: 0=对, 1=错
      const expectedTrue = question.answer === 0
      const correct = userBool === expectedTrue
      return { correct, score: correct ? 1 : 0 }
    }
    case 'concept':
    case 'scenario':
      return gradeKeywords(String(answer), question)
    default:
      return { correct: false, score: 0 }
  }
}

/** 将用户答案序列化为展示文本 */
export function answerToText(answer: string | number | number[], question: Question): string {
  if (question.type === 'single' && typeof answer === 'number') {
    const idx = answer
    return question.options?.[idx] ?? String(answer)
  }
  if (question.type === 'multiple' && Array.isArray(answer)) {
    return answer.map((i) => question.options?.[i] ?? String(i)).join('、')
  }
  if (question.type === 'boolean') {
    if (typeof answer === 'number') return answer === 0 ? '对' : '错'
    return String(answer)
  }
  return String(answer)
}
