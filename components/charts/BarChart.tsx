'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface DataPoint {
  [key: string]: string | number
}

interface BarConfig {
  dataKey: string
  name?: string
  color?: string
  stackId?: string
}

interface BarChartProps {
  data: DataPoint[]
  xAxisKey: string
  bars: BarConfig[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  layout?: 'horizontal' | 'vertical'
  formatXAxis?: (value: string) => string
  formatTooltip?: (value: number) => string
  colorByIndex?: boolean
}

const COLORS = {
  navy: '#1e3a5f',
  gold: '#d4af37',
  green: '#22c55e',
  purple: '#8b5cf6',
  blue: '#3b82f6',
  red: '#ef4444'
}

const colorPalette = [COLORS.navy, COLORS.gold, COLORS.green, COLORS.purple, COLORS.blue, COLORS.red]

export function BarChart({
  data,
  xAxisKey,
  bars,
  height = 300,
  showGrid = true,
  showLegend = true,
  layout = 'horizontal',
  formatXAxis,
  formatTooltip,
  colorByIndex = false
}: BarChartProps) {
  const isVertical = layout === 'vertical'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 20, left: isVertical ? 80 : 0, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        {isVertical ? (
          <>
            <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              tickFormatter={formatXAxis}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              width={80}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={xAxisKey}
              tickFormatter={formatXAxis}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
          </>
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number) => [formatTooltip ? formatTooltip(value) : value]}
        />
        {showLegend && bars.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="rect"
          />
        )}
        {bars.map((bar, barIndex) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name || bar.dataKey}
            fill={bar.color || colorPalette[barIndex % colorPalette.length]}
            stackId={bar.stackId}
            radius={[4, 4, 0, 0]}
          >
            {colorByIndex && data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
            ))}
          </Bar>
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
