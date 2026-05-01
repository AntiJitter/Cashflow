export type TransactionType = 'income' | 'expense'

export type RecurringPattern = 'none' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'

export type Category =
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'housing'
  | 'utilities'
  | 'subscriptions'
  | 'health'
  | 'transport'
  | 'food'
  | 'other'

export interface Transaction {
  id: string
  name: string
  type: TransactionType
  amount: number
  startDate: string
  recurringPattern: RecurringPattern
  endDate?: string
  category: Category
}

export interface DayEntry {
  name: string
  amount: number
  type: TransactionType
  category: Category
}

export interface DayData {
  dateStr: string
  label: string
  monthLabel: string
  isToday: boolean
  isWeekend: boolean
  isMonthStart: boolean
  income: number
  expense: number
  balance: number
  entries: DayEntry[]
}

export const CATEGORY_LABELS: Record<Category, string> = {
  salary: 'Salary',
  freelance: 'Freelance',
  investment: 'Investment',
  housing: 'Housing',
  utilities: 'Utilities',
  subscriptions: 'Subscriptions',
  health: 'Health & Fitness',
  transport: 'Transport',
  food: 'Food',
  other: 'Other',
}

export const CATEGORY_COLORS: Record<Category, string> = {
  salary: '#22c55e',
  freelance: '#86efac',
  investment: '#4ade80',
  housing: '#f87171',
  utilities: '#fb923c',
  subscriptions: '#c084fc',
  health: '#38bdf8',
  transport: '#fbbf24',
  food: '#f472b6',
  other: '#94a3b8',
}

export const RECURRING_LABELS: Record<RecurringPattern, string> = {
  none: 'One-time',
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
  yearly: 'Yearly',
}
