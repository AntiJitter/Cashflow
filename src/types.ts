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
  salary: '#30D158',
  freelance: '#34C759',
  investment: '#32ADE6',
  housing: '#FF453A',
  utilities: '#FF9F0A',
  subscriptions: '#BF5AF2',
  health: '#64D2FF',
  transport: '#FFD60A',
  food: '#FF375F',
  other: '#8E8E93',
}

export const RECURRING_LABELS: Record<RecurringPattern, string> = {
  none: 'One-time',
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
  yearly: 'Yearly',
}
