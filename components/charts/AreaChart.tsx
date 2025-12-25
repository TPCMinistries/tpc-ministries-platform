'use client'

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface DataPoint {
  [key: string]: string | number
}

interface AreaConfig {
  dataKey: string
  name?: string
  color?: string
  fillOpacity?: number
  stackId?: string
}

interface AreaChartProps {
  data: DataPoint[]
  xAxisKey: string
  areas: AreaConfig[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  formatXAxis?: (value: string) => string
  formatTooltip?: (value: number) => string
  gradient?: boolean
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

export function AreaChart({
  data,
  xAxisKey,
  areas,
  height = 300,
  showGrid = true,
  showLegend = true,
  formatXAxis,
  formatTooltip,
  gradient = true
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        {gradient && (
          <defs>
            {areas.map((area, index) => {
              const color = area.color || colorPalette[index % colorPalette.length]
              return (
                <linearGradient key={`gradient-${area.dataKey}`} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              )
            })}
          </defs>
        )}
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
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
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number) => [formatTooltip ? formatTooltip(value) : value]}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="rect"
          />
        )}
        {areas.map((area, index) => {
          const color = area.color || colorPalette[index % colorPalette.length]
          return (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name || area.dataKey}
              stroke={color}
              strokeWidth={2}
              fill={gradient ? `url(#gradient-${area.dataKey})` : color}
              fillOpacity={gradient ? 1 : (area.fillOpacity || 0.3)}
              stackId={area.stackId}
            />
          )
        })}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}
