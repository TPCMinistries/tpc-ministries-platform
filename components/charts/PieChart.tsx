'use client'

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface DataPoint {
  name: string
  value: number
  color?: string
}

interface PieChartProps {
  data: DataPoint[]
  height?: number
  showLegend?: boolean
  innerRadius?: number
  outerRadius?: number
  formatValue?: (value: number) => string
  showLabels?: boolean
}

const COLORS = {
  navy: '#1e3a5f',
  gold: '#d4af37',
  green: '#22c55e',
  purple: '#8b5cf6',
  blue: '#3b82f6',
  red: '#ef4444',
  gray: '#9ca3af'
}

const colorPalette = [COLORS.navy, COLORS.gold, COLORS.green, COLORS.purple, COLORS.blue, COLORS.red, COLORS.gray]

export function PieChart({
  data,
  height = 300,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
  formatValue,
  showLabels = false
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const renderLabel = ({ name, value, percent }: { name: string; value: number; percent: number }) => {
    if (!showLabels) return null
    return `${name}: ${(percent * 100).toFixed(0)}%`
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          label={showLabels ? renderLabel : false}
          labelLine={showLabels}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || colorPalette[index % colorPalette.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string) => [
            formatValue ? formatValue(value) : value,
            name
          ]}
        />
        {showLegend && (
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value, entry) => {
              const item = data.find(d => d.name === value)
              const percent = item ? ((item.value / total) * 100).toFixed(1) : 0
              return `${value} (${percent}%)`
            }}
          />
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}

export function DonutChart(props: PieChartProps) {
  return <PieChart {...props} innerRadius={60} outerRadius={80} />
}
