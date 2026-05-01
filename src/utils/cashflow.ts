import {
  addDays,
  format,
  parseISO,
  isSameDay,
  isAfter,
  isBefore,
  startOfDay,
  isWeekend,
  isFirstDayOfMonth,
} from 'date-fns'
import { Transaction, DayData } from '../types'

export function generateDayData(
  transactions: Transaction[],
  windowStart: Date,
  windowEnd: Date,
  initialBalance: number,
  balanceAnchorDate: Date,
): DayData[] {
  // Walk from the earliest possible date to build correct running balance
  const earliest = transactions.reduce((min, tx) => {
    const d = startOfDay(parseISO(tx.startDate))
    return isBefore(d, min) ? d : min
  }, startOfDay(balanceAnchorDate))

  const walkStart = isBefore(earliest, startOfDay(windowStart)) ? earliest : startOfDay(windowStart)

  const days: DayData[] = []
  let balance = initialBalance
  let current = startOfDay(walkStart)
  const end = startOfDay(windowEnd)

  while (!isAfter(current, end)) {
    const inWindow = !isBefore(current, startOfDay(windowStart))
    const entries: DayData['entries'] = []
    let dayIncome = 0
    let dayExpense = 0

    for (const tx of transactions) {
      if (appliesOnDate(tx, current)) {
        entries.push({ name: tx.name, amount: tx.amount, type: tx.type, category: tx.category })
        if (tx.type === 'income') {
          dayIncome += tx.amount
        } else {
          dayExpense += tx.amount
        }
      }
    }

    balance = balance + dayIncome - dayExpense

    if (inWindow) {
      days.push({
        dateStr: format(current, 'yyyy-MM-dd'),
        label: format(current, 'd'),
        monthLabel: format(current, 'MMM yyyy'),
        isToday: isSameDay(current, new Date()),
        isWeekend: isWeekend(current),
        isMonthStart: isFirstDayOfMonth(current),
        income: dayIncome,
        expense: dayExpense,
        balance,
        entries,
      })
    }

    current = addDays(current, 1)
  }

  return days
}

function appliesOnDate(tx: Transaction, date: Date): boolean {
  const start = startOfDay(parseISO(tx.startDate))
  const end = tx.endDate ? startOfDay(parseISO(tx.endDate)) : null

  if (isBefore(date, start)) return false
  if (end && isAfter(date, end)) return false

  switch (tx.recurringPattern) {
    case 'none':
      return isSameDay(date, start)
    case 'weekly': {
      const ms = date.getTime() - start.getTime()
      const days = Math.round(ms / 86400000)
      return days >= 0 && days % 7 === 0
    }
    case 'biweekly': {
      const ms = date.getTime() - start.getTime()
      const days = Math.round(ms / 86400000)
      return days >= 0 && days % 14 === 0
    }
    case 'monthly':
      return date.getDate() === start.getDate()
    case 'yearly':
      return date.getDate() === start.getDate() && date.getMonth() === start.getMonth()
    default:
      return false
  }
}

export function formatCurrency(amount: number, currency = 'NOK'): string {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function monthlyTotal(transactions: Transaction[], type: 'income' | 'expense'): number {
  return transactions
    .filter((tx) => tx.type === type)
    .reduce((sum, tx) => {
      if (tx.recurringPattern === 'monthly') return sum + tx.amount
      if (tx.recurringPattern === 'weekly') return sum + tx.amount * 4.33
      if (tx.recurringPattern === 'biweekly') return sum + tx.amount * 2.17
      if (tx.recurringPattern === 'yearly') return sum + tx.amount / 12
      return sum
    }, 0)
}
