'use client'

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

interface DataPoint {
  [key: string]: string | number | undefined
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

function formatTooltipValue(value: ValueType | undefined, formatter?: (value: number) => string) {
  if (typeof value === 'number') {
    return formatter ? formatter(value) : value
  }

  return value ?? ''
}

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

  const renderLabel = ({ name, percent }: PieLabelRenderProps) => {
    if (!showLabels) return null
    return `${name || 'Item'}: ${((percent || 0) * 100).toFixed(0)}%`
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
          formatter={(value: ValueType | undefined, name: NameType | undefined) => [
            formatTooltipValue(value, formatValue),
            name || ''
          ]}
        />
        {showLegend && (
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value) => {
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
