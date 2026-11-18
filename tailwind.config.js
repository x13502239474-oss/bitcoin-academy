/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 深海军蓝背景层级
        ink: {
          950: '#05070d',
          900: '#080c16',
          850: '#0b1120',
          800: '#0f1728',
          750: '#141d33',
          700: '#1b2740',
        },
        // 比特币橙（强调色）
        btc: {
          300: '#ffc266',
          400: '#ffab2e',
          500: '#f7931a',
          600: '#d97706',
          700: '#b45309',
        },
        // 冰蓝（次要强调 / 数据可视化）
        ice: {
          200: '#cfe8ff',
          300: '#9ecbff',
          400: '#5fa8ff',
          500: '#3b82f6',
        },
        mist: {
          100: '#f2f6fc',
          200: '#d6e0ee',
          300: '#a9b8ce',
          400: '#7d8fa8',
          500: '#5a6b83',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"PingFang SC"', '"Microsoft YaHei"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-btc': '0 0 24px -4px rgba(247,147,26,0.35)',
        'glow-ice': '0 0 24px -4px rgba(95,168,255,0.30)',
        panel: '0 8px 32px -8px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '100%': { transform: 'scale(1.15)', opacity: '0' },
        },
        'flow': {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'flow': 'flow 1s linear infinite',
      },
    },
  },
  plugins: [],
}
