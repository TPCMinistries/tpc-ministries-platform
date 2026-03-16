import dynamic from 'next/dynamic'

export const LineChart = dynamic(
  () => import('./LineChart').then(mod => ({ default: mod.LineChart })),
  { ssr: false }
)

export const BarChart = dynamic(
  () => import('./BarChart').then(mod => ({ default: mod.BarChart })),
  { ssr: false }
)

export const PieChart = dynamic(
  () => import('./PieChart').then(mod => ({ default: mod.PieChart })),
  { ssr: false }
)

export const DonutChart = dynamic(
  () => import('./PieChart').then(mod => ({ default: mod.DonutChart })),
  { ssr: false }
)

export const AreaChart = dynamic(
  () => import('./AreaChart').then(mod => ({ default: mod.AreaChart })),
  { ssr: false }
)

export const CHART_COLORS = {
  navy: '#1e3a5f',
  gold: '#d4af37',
  green: '#22c55e',
  purple: '#8b5cf6',
  blue: '#3b82f6',
  red: '#ef4444',
  gray: '#9ca3af'
}
