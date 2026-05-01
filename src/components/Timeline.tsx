import { useRef, useEffect, useMemo, useCallback } from 'react'
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Area,
  CartesianGrid,
} from 'recharts'
import { addDays, startOfDay, subDays, format } from 'date-fns'
import { Transaction, DayData, CATEGORY_COLORS } from '../types'
import { generateDayData, formatCurrency } from '../utils/cashflow'

const DAYS_BACK = 60
const DAYS_FORWARD = 150
const PX_PER_DAY = 44
const CHART_HEIGHT_TOP = 220
const CHART_HEIGHT_BOTTOM = 150

// Apple HIG colors
const C_INCOME = '#30D158'
const C_EXPENSE = '#FF453A'
const C_BALANCE = '#0A84FF'
const C_TODAY_LINE = '#0A84FF'

interface Props {
  transactions: Transaction[]
  initialBalance: number
  currency: string
}

interface TickProps {
  x?: number
  y?: number
  payload?: { value: string }
  data: DayData[]
}

function DayTick({ x = 0, y = 0, payload, data }: TickProps) {
  const day = data.find((d) => d.label === payload?.value)
  if (!day) return null

  const num = parseInt(payload?.value ?? '0')
  const showLabel = day.isMonthStart || day.isToday || num % 7 === 0

  if (day.isToday) {
    return (
      <g transform={`translate(${x},${y})`}>
        <rect x={-14} y={2} width={28} height={16} rx={8} fill={`${C_TODAY_LINE}22`} />
        <text x={0} y={13} textAnchor="middle" fill={C_TODAY_LINE} fontSize={10} fontWeight="700">
          {payload?.value}
        </text>
      </g>
    )
  }

  if (day.isMonthStart) {
    return (
      <g transform={`translate(${x},${y})`}>
        <line x1={0} y1={0} x2={0} y2={4} stroke="#3A3A3C" strokeWidth={1} />
        <text x={0} y={14} textAnchor="middle" fill="#636366" fontSize={9} fontWeight="600">
          1
        </text>
      </g>
    )
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <line x1={0} y1={0} x2={0} y2={3} stroke="#3A3A3C" strokeWidth={1} />
      {showLabel && (
        <text x={0} y={13} textAnchor="middle" fill="#48484A" fontSize={9}>
          {payload?.value}
        </text>
      )}
    </g>
  )
}

interface TooltipProps {
  active?: boolean
  label?: string
  data: DayData[]
  currency: string
}

function DayTooltip({ active, label, data, currency }: TooltipProps) {
  if (!active || !label) return null
  const day = data.find((d) => d.label === label)
  if (!day || (day.income === 0 && day.expense === 0)) return null

  return (
    <div
      style={{
        background: 'rgba(28,28,30,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      className="rounded-2xl p-3.5 shadow-2xl min-w-52"
    >
      <div className="mb-2.5 text-xs font-semibold" style={{ color: '#EBEBF5CC' }}>
        {format(new Date(day.dateStr + 'T12:00:00'), 'EEE d MMM yyyy')}
        {day.isToday && (
          <span
            className="ml-2 rounded-full px-1.5 py-0.5 text-[10px]"
            style={{ background: `${C_TODAY_LINE}25`, color: C_TODAY_LINE }}
          >
            Today
          </span>
        )}
      </div>
      {day.entries.map((e, i) => (
        <div key={i} className="flex items-center gap-2 text-xs py-0.5">
          <div
            className="h-2 w-2 flex-shrink-0 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS[e.category] }}
          />
          <span className="flex-1" style={{ color: '#EBEBF599' }}>
            {e.name}
          </span>
          <span
            className="font-semibold tabular-nums"
            style={{ color: e.type === 'income' ? C_INCOME : C_EXPENSE }}
          >
            {e.type === 'income' ? '+' : '−'}
            {formatCurrency(e.amount, currency)}
          </span>
        </div>
      ))}
      <div
        className="mt-2.5 flex justify-between pt-2.5 text-xs"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <span style={{ color: '#636366' }}>Balance after</span>
        <span
          className="font-bold tabular-nums"
          style={{ color: day.balance >= 0 ? '#FFFFFF' : C_EXPENSE }}
        >
          {formatCurrency(day.balance, currency)}
        </span>
      </div>
    </div>
  )
}

interface MonthBandProps {
  data: DayData[]
}

function MonthBands({ data }: MonthBandProps) {
  const months: { label: string; count: number }[] = []

  data.forEach((d) => {
    if (d.isMonthStart || months.length === 0) {
      months.push({ label: d.monthLabel, count: 1 })
    } else {
      months[months.length - 1].count++
    }
  })

  return (
    <div className="flex flex-shrink-0" style={{ height: 32 }}>
      {months.map((m, idx) => {
        const width = m.count * PX_PER_DAY
        const isEven = idx % 2 === 0
        return (
          <div
            key={m.label}
            className="flex flex-shrink-0 items-center px-3"
            style={{
              width,
              borderRight: '1px solid rgba(255,255,255,0.06)',
              background: isEven ? 'rgba(255,255,255,0.025)' : 'transparent',
            }}
          >
            <span
              className="text-xs font-semibold whitespace-nowrap"
              style={{ color: '#8E8E93' }}
            >
              {m.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// SVG overlay: alternating day columns + today highlight
interface DayColumnsProps {
  data: DayData[]
  width?: number
  height?: number
}

function DayColumns({ data, width = 0, height = 0 }: DayColumnsProps) {
  if (!width || !height) return null
  const colW = width / data.length

  return (
    <g>
      {data.map((day, i) => {
        if (!day.isToday && !day.isWeekend) return null
        return (
          <rect
            key={day.dateStr}
            x={i * colW}
            y={0}
            width={colW}
            height={height}
            fill={
              day.isToday
                ? `${C_TODAY_LINE}12`
                : 'rgba(255,255,255,0.018)'
            }
          />
        )
      })}
    </g>
  )
}

export function Timeline({ transactions, initialBalance, currency }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const today = startOfDay(new Date())

  const windowStart = subDays(today, DAYS_BACK)
  const windowEnd = addDays(today, DAYS_FORWARD)
  const totalWidth = (DAYS_BACK + DAYS_FORWARD + 1) * PX_PER_DAY

  const dayData = useMemo(
    () => generateDayData(transactions, windowStart, windowEnd, initialBalance, today),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, initialBalance],
  )

  const chartData = dayData.map((d) => ({
    ...d,
    expenseNeg: d.expense > 0 ? -d.expense : 0,
  }))

  // Auto-scroll to today
  useEffect(() => {
    if (containerRef.current) {
      const todayOffset = DAYS_BACK * PX_PER_DAY
      const half = containerRef.current.clientWidth / 2
      containerRef.current.scrollLeft = todayOffset - half + PX_PER_DAY / 2
    }
  }, [])

  // Wheel → horizontal scroll
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    if (containerRef.current) {
      containerRef.current.scrollLeft += e.deltaY * 1.5
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const todayIndex = dayData.findIndex((d) => d.isToday)

  const minBalance = Math.min(...dayData.map((d) => d.balance))
  const maxBalance = Math.max(...dayData.map((d) => d.balance))
  const balancePad = Math.max((maxBalance - minBalance) * 0.12, 500)
  const maxBar = Math.max(...dayData.map((d) => Math.max(d.income, d.expense)), 100)

  const customDayColumns = (props: object) => <DayColumns {...(props as DayColumnsProps)} data={dayData} />

  return (
    <div className="flex h-full flex-col" style={{ background: '#111113' }}>
      <div
        ref={containerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden select-none"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#3A3A3C transparent' }}
      >
        <div style={{ width: totalWidth, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Month header */}
          <MonthBands data={dayData} />

          {/* Today line */}
          {todayIndex >= 0 && (
            <div className="relative" style={{ height: 0, zIndex: 10, pointerEvents: 'none' }}>
              <div
                style={{
                  position: 'absolute',
                  left: todayIndex * PX_PER_DAY + PX_PER_DAY / 2 - 0.5,
                  top: 0,
                  width: 1,
                  height: CHART_HEIGHT_TOP + CHART_HEIGHT_BOTTOM,
                  background: `linear-gradient(to bottom, ${C_TODAY_LINE}99, ${C_TODAY_LINE}11)`,
                }}
              />
            </div>
          )}

          {/* Income / Expense bars */}
          <ComposedChart
            width={totalWidth}
            height={CHART_HEIGHT_TOP}
            data={chartData}
            margin={{ top: 12, right: 0, left: 0, bottom: 0 }}
            syncId="cf"
          >
            <CartesianGrid
              vertical={true}
              horizontal={false}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
            />
            <XAxis
              dataKey="label"
              tick={(props) => <DayTick {...props} data={dayData} />}
              tickLine={false}
              axisLine={false}
              height={20}
              interval={0}
            />
            <YAxis domain={[-maxBar * 1.2, maxBar * 1.2]} hide />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
            <Tooltip
              content={(props) => (
                <DayTooltip
                  active={props.active}
                  label={props.label}
                  data={dayData}
                  currency={currency}
                />
              )}
              cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 4 }}
            />
            {/* @ts-expect-error recharts customized */}
            <CartesianGrid customized={customDayColumns} />
            <Bar
              dataKey="income"
              fill={C_INCOME}
              opacity={0.9}
              radius={[4, 4, 1, 1]}
              maxBarSize={PX_PER_DAY - 12}
            />
            <Bar
              dataKey="expenseNeg"
              fill={C_EXPENSE}
              opacity={0.85}
              radius={[1, 1, 4, 4]}
              maxBarSize={PX_PER_DAY - 12}
            />
          </ComposedChart>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />

          {/* Balance area */}
          <ComposedChart
            width={totalWidth}
            height={CHART_HEIGHT_BOTTOM}
            data={chartData}
            margin={{ top: 8, right: 0, left: 0, bottom: 8 }}
            syncId="cf"
          >
            <CartesianGrid
              vertical={true}
              horizontal={false}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
            />
            <XAxis dataKey="label" hide />
            <YAxis domain={[minBalance - balancePad, maxBalance + balancePad]} hide />
            <ReferenceLine
              y={0}
              stroke={`${C_EXPENSE}55`}
              strokeDasharray="3 4"
              strokeWidth={1}
            />
            <Tooltip content={() => null} cursor={false} />
            <defs>
              <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C_BALANCE} stopOpacity={0.35} />
                <stop offset="100%" stopColor={C_BALANCE} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="balance"
              stroke={C_BALANCE}
              strokeWidth={2.5}
              fill="url(#balGrad)"
              dot={false}
              activeDot={{
                r: 5,
                fill: C_BALANCE,
                stroke: '#1C1C1E',
                strokeWidth: 2,
              }}
            />
          </ComposedChart>

          {/* Legend */}
          <div
            className="flex flex-shrink-0 items-center gap-5 px-5 py-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <LegendItem color={C_INCOME} label="Income" />
            <LegendItem color={C_EXPENSE} label="Expenses" />
            <div className="flex items-center gap-2">
              <div style={{ height: 2, width: 20, borderRadius: 1, background: C_BALANCE }} />
              <span className="text-xs" style={{ color: '#636366' }}>
                Balance
              </span>
            </div>
            <span className="ml-auto text-xs" style={{ color: '#3A3A3C' }}>
              scroll or use mouse wheel →
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div style={{ height: 10, width: 10, borderRadius: 3, background: color }} />
      <span className="text-xs" style={{ color: '#636366' }}>
        {label}
      </span>
    </div>
  )
}
