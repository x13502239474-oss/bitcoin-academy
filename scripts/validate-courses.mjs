/**
 * 课程数据一致性校验（终检用）
 * 用法：npm run verify:courses
 * 检查：字段完整 / quizIds 死链 / 孤儿题 / id 重复 / 每课题数 / modules.lessonIds 是否与课程数据一致
 */
import { modules, lessons, questions, lessonById, mapNodes } from '../src/data/index.ts'

const problems = []
const warns = []

// 1. id 唯一性
const dupLesson = lessons.map((l) => l.id).filter((id, i, a) => a.indexOf(id) !== i)
const dupQ = questions.map((q) => q.id).filter((id, i, a) => a.indexOf(id) !== i)
if (dupLesson.length) problems.push(`课程 id 重复：${[...new Set(dupLesson)].join(', ')}`)
if (dupQ.length) problems.push(`题目 id 重复：${[...new Set(dupQ)].join(', ')}`)

// 2. 每课字段完整性
const REQUIRED = ['id', 'moduleId', 'order', 'title', 'estMinutes', 'objectives', 'coreQuestion', 'terms', 'content', 'keyPoints', 'quizIds', 'furtherReading']
const DEEP = ['intro', 'workedExample', 'analysis', 'misconceptions'] // 技术深度字段
for (const l of lessons) {
  for (const f of REQUIRED) {
    if (l[f] === undefined || l[f] === null) problems.push(`${l.id} 缺少字段 ${f}`)
    else if (Array.isArray(l[f]) && l[f].length === 0 && f !== 'furtherReading') problems.push(`${l.id} 字段 ${f} 为空数组`)
  }
  for (const f of DEEP) {
    if (!l[f]) warns.push(`${l.id} 缺少深度字段 ${f}`)
  }
  if (!l.diagram && !(l.diagrams && l.diagrams.length)) problems.push(`${l.id} 没有任何图解`)
  if (l.quizIds.length < 5) warns.push(`${l.id} 随堂题只有 ${l.quizIds.length} 道（目标 >=5）`)
  if (l.terms.length < 8) warns.push(`${l.id} 术语只有 ${l.terms.length} 条（目标 >=10）`)
  if (l.content.length < 12) warns.push(`${l.id} 内容块只有 ${l.content.length} 个（目标 >=15）`)
  if (!l.misconceptions || l.misconceptions.length < 3) warns.push(`${l.id} 常见误区不足 3 条`)
}

// 3. quizIds 死链
const qIds = new Set(questions.map((q) => q.id))
for (const l of lessons) {
  for (const qid of l.quizIds) {
    if (!qIds.has(qid)) problems.push(`${l.id} 引用了不存在的题目 ${qid}`)
  }
}

// 4. 孤儿题（无课程引用）
const referenced = new Set(lessons.flatMap((l) => l.quizIds))
const orphans = questions.filter((q) => !referenced.has(q.id))
if (orphans.length) warns.push(`未被任何课程引用的题目 ${orphans.length} 道：${orphans.map((q) => q.id).join(', ')}`)

// 5. 题目字段完整性
for (const q of questions) {
  if (!q.explanation) problems.push(`${q.id} 缺少 explanation`)
  if (!q.derivation) warns.push(`${q.id} 缺少 derivation`)
  if (!q.pitfalls) warns.push(`${q.id} 缺少 pitfalls`)
  if (!q.tags || q.tags.length < 2) problems.push(`${q.id} tags 少于 2 个`)
  if (![1, 2, 3].includes(q.difficulty)) problems.push(`${q.id} difficulty 非法`)
  if ((q.type === 'concept' || q.type === 'scenario') && (!q.keywords || q.keywords.length < 2)) {
    problems.push(`${q.id} 要点题缺少 keywords`)
  }
  if (q.type === 'single' || q.type === 'multiple') {
    if (!q.options || q.options.length < 2) problems.push(`${q.id} 选择题缺少选项`)
    const idx = Array.isArray(q.answer) ? q.answer : [q.answer]
    if (idx.some((i) => i === undefined || i < 0 || i >= (q.options?.length ?? 0))) problems.push(`${q.id} 答案索引越界`)
  }
  if (q.type === 'boolean' && q.answer !== 0 && q.answer !== 1) problems.push(`${q.id} 判断题答案非法`)
}

// 6. modules.lessonIds 与实际课程一致性
for (const m of modules) {
  const actual = lessons.filter((l) => l.moduleId === m.id).sort((a, b) => a.order - b.order).map((l) => l.id)
  const declared = m.lessonIds
  if (actual.length !== declared.length || actual.some((id, i) => id !== declared[i])) {
    problems.push(`模块 ${m.id} lessonIds 与课程数据不一致\n    声明：${declared.join(', ')}\n    实际：${actual.join(', ')}`)
  }
}

// 7. 知识地图 target 死链
const labIds = new Set(['hash', 'keypair', 'address', 'utxo', 'blockchain', 'mining'])
for (const n of mapNodes) {
  const ok = n.target.kind === 'lesson' ? lessonById.has(n.target.id) : labIds.has(n.target.id)
  if (!ok) problems.push(`知识地图节点 ${n.id} 指向不存在的目标 ${n.target.kind}:${n.target.id}`)
}

// 输出
const byModule = modules.map((m) => {
  const ls = lessons.filter((l) => l.moduleId === m.id)
  const qs = questions.filter((q) => q.moduleId === m.id)
  return `  ${m.id} ${m.title.padEnd(12)} 课程 ${String(ls.length).padStart(2)} · 题目 ${String(qs.length).padStart(2)} · 内容块 ${String(ls.reduce((s, l) => s + l.content.length, 0)).padStart(3)}`
})
console.log('==== 课程规模 ====')
console.log(byModule.join('\n'))
console.log(`\n合计：${lessons.length} 节课 · ${questions.length} 道题 · ${mapNodes.length} 个地图节点`)

console.log(`\n==== 问题（${problems.length}）====`)
problems.forEach((p) => console.log('  ✗ ' + p))
if (!problems.length) console.log('  无')

console.log(`\n==== 提醒（${warns.length}）====`)
warns.slice(0, 40).forEach((w) => console.log('  ! ' + w))
if (warns.length > 40) console.log(`  ... 另有 ${warns.length - 40} 条`)

process.exit(problems.length ? 1 : 0)
