/** 格式化 BTC 金额（最多 8 位小数，去掉尾部 0） */
export function fmtBTC(value: number, maxDecimals = 8): string {
  if (!isFinite(value)) return '—'
  return value
    .toFixed(maxDecimals)
    .replace(/0+$/, '')
    .replace(/\.$/, '')
}

/** 格式化聪（satoshi） */
export function fmtSats(sats: number): string {
  return sats.toLocaleString('en-US') + ' sat'
}

/** 缩短哈希显示 */
export function shorten(str: string, head = 8, tail = 6): string {
  if (!str) return ''
  return str.length <= head + tail + 3 ? str : `${str.slice(0, head)}…${str.slice(-tail)}`
}

/** 日期 YYYY-MM-DD（本地时区） */
export function dayKey(ts: number = Date.now()): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 计算连续天数 */
export function calcStreak(activity: Record<string, number>): number {
  let streak = 0
  const cursor = new Date()
  // 若今天没活动，从昨天开始算（今天还没学习不算断）
  if (!activity[dayKey(cursor.getTime())]) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (true) {
    const k = dayKey(cursor.getTime())
    if (activity[k] && activity[k] > 0) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

/** 随机数种子（可复现，用于教学模拟） */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}
