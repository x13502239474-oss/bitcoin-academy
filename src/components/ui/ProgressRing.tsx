interface Props {
  value: number // 0-100
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
}

/** 首页中央大型圆形进度仪表盘 */
export function ProgressRing({ value, size = 220, stroke = 12, label, sublabel }: Props) {
  const v = Math.max(0, Math.min(100, value))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (v / 100) * c

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* 底层装饰环 */}
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(120,150,200,0.10)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r - stroke - 6} fill="none" stroke="rgba(120,150,200,0.05)" strokeWidth={1} strokeDasharray="2 8" />
      </svg>
      {/* 进度环 */}
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="55%" stopColor="#f7931a" />
            <stop offset="100%" stopColor="#ffc266" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: 'drop-shadow(0 0 8px rgba(247,147,26,0.45))' }}
        />
      </svg>
      <div className="relative flex flex-col items-center">
        <div className="text-[11px] font-semibold tracking-[0.25em] text-mist-500 uppercase">Progress</div>
        <div className="text-5xl font-bold tabular-nums text-gradient-btc">{Math.round(v)}<span className="text-2xl">%</span></div>
        {label && <div className="mt-1 text-xs text-mist-300">{label}</div>}
        {sublabel && <div className="mt-0.5 text-[10px] text-mist-500">{sublabel}</div>}
      </div>
    </div>
  )
}
