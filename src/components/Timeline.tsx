import { useRef, useEffect, useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Area,
  ResponsiveContainer,
} from 'recharts'
import { addDays, startOfDay, subDays, format } from 'date-fns'
import { Transaction, DayData, CATEGORY_COLORS } from '../types'
import { generateDayData, formatCurrency } from '../utils/cashflow'

const DAYS_BACK = 60
const DAYS_FORWARD = 150
const PX_PER_DAY = 38
const CHART_HEIGHT_TOP = 200
const CHART_HEIGHT_BOTTOM = 130

interface Props {
  transactions: Transaction[]
  initialBalance: number
  currency: string
}

interface CustomTickProps {
  x?: number
  y?: number
  payload?: { value: string }
  data: DayData[]
}

function CustomXTick({ x = 0, y = 0, payload, data }: CustomTickProps) {
  const day = data.find((d) => d.label === payload?.value)
  if (!day) return null

  const isMonthStart = day.isMonthStart
  const isToday = day.isToday

  if (isToday) {
    return (
      <g transform={`translate(${x},${y})`}>
        <circle cx={0} cy={-CHART_HEIGHT_TOP - 8} r={3} fill="#60a5fa" />
        <text x={0} y={5} textAnchor="middle" fill="#60a5fa" fontSize={10} fontWeight="bold">
          {payload?.value}
        </text>
      </g>
    )
  }

  if (isMonthStart) {
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={5} textAnchor="middle" fill="#64748b" fontSize={9}>
          {payload?.value}
        </text>
      </g>
    )
  }

  // Only show every 5th day to avoid crowding
  const dayNum = parseInt(payload?.value ?? '0')
  if (dayNum % 5 !== 0) return null

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={5} textAnchor="middle" fill="#475569" fontSize={9}>
        {payload?.value}
      </text>
    </g>
  )
}

interface CustomTooltipProps {
  active?: boolean
  label?: string
  data: DayData[]
  currency: string
}

function CustomTooltip({ active, label, data, currency }: CustomTooltipProps) {
  if (!active || !label) return null
  const day = data.find((d) => d.label === label)
  if (!day || (day.income === 0 && day.expense === 0)) return null

  return (
    <div className="rounded-xl border border-slate-600 bg-slate-800/95 p-3 shadow-xl backdrop-blur-sm min-w-48">
      <div className="mb-2 text-xs font-semibold text-slate-300">
        {format(new Date(day.dateStr + 'T12:00:00'), 'EEE d MMM yyyy')}
        {day.isToday && (
          <span className="ml-2 rounded-full bg-blue-500/20 px-1.5 py-0.5 text-blue-400">
            Today
          </span>
        )}
      </div>
      {day.entries.map((e, i) => (
        <div key={i} className="flex items-center gap-2 text-xs py-0.5">
          <div
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: CATEGORY_COLORS[e.category] }}
          />
          <span className="text-slate-300 flex-1">{e.name}</span>
          <span
            className={`font-semibold tabular-nums ${
              e.type === 'income' ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {e.type === 'income' ? '+' : '-'}
            {formatCurrency(e.amount, currency)}
          </span>
        </div>
      ))}
      <div className="mt-2 border-t border-slate-700 pt-2 flex justify-between text-xs">
        <span className="text-slate-400">Balance after</span>
        <span
          className={`font-bold tabular-nums ${day.balance >= 0 ? 'text-white' : 'text-red-400'}`}
        >
          {formatCurrency(day.balance, currency)}
        </span>
      </div>
    </div>
  )
}

interface MonthBandProps {
  data: DayData[]
  totalWidth: number
}

function MonthBands({ data, totalWidth: _totalWidth }: MonthBandProps) {
  const months: { label: string; startIdx: number; endIdx: number }[] = []

  data.forEach((d, i) => {
    if (d.isMonthStart || i === 0) {
      if (months.length > 0) months[months.length - 1].endIdx = i - 1
      months.push({ label: d.monthLabel, startIdx: i, endIdx: data.length - 1 })
    }
  })

  return (
    <div className="relative flex" style={{ height: 28 }}>
      {months.map((m, idx) => {
        const width = (m.endIdx - m.startIdx + 1) * PX_PER_DAY
        const isEven = idx % 2 === 0
        return (
          <div
            key={m.label}
            className={`flex flex-shrink-0 items-center border-r border-slate-700/50 px-2 ${
              isEven ? 'bg-slate-800/30' : 'bg-slate-900/30'
            }`}
            style={{ width }}
          >
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">{m.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export function Timeline({ transactions, initialBalance, currency }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const today = startOfDay(new Date())

  const windowStart = subDays(today, DAYS_BACK)
  const windowEnd = addDays(today, DAYS_FORWARD)
  const totalDays = DAYS_BACK + DAYS_FORWARD + 1
  const totalWidth = totalDays * PX_PER_DAY

  const dayData = useMemo(
    () => generateDayData(transactions, windowStart, windowEnd, initialBalance, today),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, initialBalance],
  )

  // Balance data uses full range but maps to same x positions
  const balanceData = dayData.map((d) => ({ ...d, expenseNeg: d.expense > 0 ? -d.expense : 0 }))

  useEffect(() => {
    if (containerRef.current) {
      const todayOffset = DAYS_BACK * PX_PER_DAY
      const halfView = containerRef.current.clientWidth / 2
      containerRef.current.scrollLeft = todayOffset - halfView + PX_PER_DAY / 2
    }
  }, [])

  const todayIndex = dayData.findIndex((d) => d.isToday)

  const minBalance = Math.min(...dayData.map((d) => d.balance))
  const maxBalance = Math.max(...dayData.map((d) => d.balance))
  const balancePadding = Math.max((maxBalance - minBalance) * 0.1, 500)

  const maxBarValue = Math.max(...dayData.map((d) => Math.max(d.income, d.expense)), 100)

  return (
    <div className="flex flex-col h-full">
      <div
        ref={containerRef}
        className="overflow-x-auto flex-1 select-none"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
      >
        <div style={{ width: totalWidth, minHeight: '100%' }} className="flex flex-col">
          {/* Month labels */}
          <MonthBands data={dayData} totalWidth={totalWidth} />

          {/* Today marker line */}
          {todayIndex >= 0 && (
            <div className="relative" style={{ height: 0 }}>
              <div
                className="absolute top-0 z-10"
                style={{
                  left: todayIndex * PX_PER_DAY + PX_PER_DAY / 2 - 0.5,
                  width: 1,
                  height: CHART_HEIGHT_TOP + CHART_HEIGHT_BOTTOM + 8,
                  background: 'linear-gradient(to bottom, #60a5fa88, #60a5fa22)',
                  pointerEvents: 'none',
                }}
              />
              <div
                className="absolute z-10 -translate-x-1/2 px-1.5 py-0.5 rounded text-blue-400 text-xs font-bold"
                style={{ left: todayIndex * PX_PER_DAY + PX_PER_DAY / 2, top: 0 }}
              >
              </div>
            </div>
          )}

          {/* Income / Expense bars */}
          <ComposedChart
            width={totalWidth}
            height={CHART_HEIGHT_TOP}
            data={balanceData}
            margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            syncId="cashflow"
          >
            <XAxis
              dataKey="label"
              tick={(props) => <CustomXTick {...props} data={dayData} />}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
              height={18}
            />
            <YAxis
              domain={[-maxBarValue * 1.15, maxBarValue * 1.15]}
              hide
            />
            <ReferenceLine y={0} stroke="#334155" strokeWidth={1} />
            <Tooltip
              content={(props) => (
                <CustomTooltip
                  active={props.active}
                  label={props.label}
                  data={dayData}
                  currency={currency}
                />
              )}
              cursor={{ fill: '#ffffff08' }}
            />
            <Bar
              dataKey="income"
              fill="#22c55e"
              opacity={0.85}
              radius={[3, 3, 0, 0]}
              maxBarSize={PX_PER_DAY - 8}
            />
            <Bar
              dataKey="expenseNeg"
              fill="#ef4444"
              opacity={0.8}
              radius={[0, 0, 3, 3]}
              maxBarSize={PX_PER_DAY - 8}
            />
          </ComposedChart>

          {/* Balance area chart */}
          <ComposedChart
            width={totalWidth}
            height={CHART_HEIGHT_BOTTOM}
            data={balanceData}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            syncId="cashflow"
          >
            <XAxis dataKey="label" hide />
            <YAxis
              domain={[minBalance - balancePadding, maxBalance + balancePadding]}
              hide
            />
            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} opacity={0.5} />
            <Tooltip
              content={() => null}
              cursor={false}
            />
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#60a5fa"
              strokeWidth={2}
              fill="url(#balanceGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#60a5fa', stroke: '#1e293b', strokeWidth: 2 }}
            />
          </ComposedChart>

          {/* Legend */}
          <div className="flex items-center gap-4 px-4 py-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500 opacity-85" />
              Income
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-red-500 opacity-80" />
              Expenses
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-5 rounded bg-blue-400" />
              Balance
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="flex justify-center pb-1 pt-0.5">
        <span className="text-xs text-slate-600">← scroll to explore →</span>
      </div>
    </div>
  )
}

// Needed for recharts ResponsiveContainer usage
export { ResponsiveContainer }
