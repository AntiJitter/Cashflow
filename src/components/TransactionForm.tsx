import { useState } from 'react'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import {
  Transaction,
  TransactionType,
  RecurringPattern,
  Category,
  CATEGORY_LABELS,
  RECURRING_LABELS,
} from '../types'

interface Props {
  onAdd: (tx: Omit<Transaction, 'id'>) => void
  onClose: () => void
  editTx?: Transaction
  onUpdate?: (tx: Transaction) => void
}

const INCOME_CATEGORIES: Category[] = ['salary', 'freelance', 'investment', 'other']
const EXPENSE_CATEGORIES: Category[] = [
  'housing',
  'utilities',
  'subscriptions',
  'health',
  'transport',
  'food',
  'other',
]

export function TransactionForm({ onAdd, onClose, editTx, onUpdate }: Props) {
  const [type, setType] = useState<TransactionType>(editTx?.type ?? 'expense')
  const [name, setName] = useState(editTx?.name ?? '')
  const [amount, setAmount] = useState(editTx ? String(editTx.amount) : '')
  const [startDate, setStartDate] = useState(
    editTx?.startDate ?? format(new Date(), 'yyyy-MM-dd'),
  )
  const [recurring, setRecurring] = useState<RecurringPattern>(
    editTx?.recurringPattern ?? 'monthly',
  )
  const [endDate, setEndDate] = useState(editTx?.endDate ?? '')
  const [category, setCategory] = useState<Category>(
    editTx?.category ?? (type === 'income' ? 'salary' : 'housing'),
  )

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  function handleTypeChange(t: TransactionType) {
    setType(t)
    setCategory(t === 'income' ? 'salary' : 'housing')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = parseFloat(amount.replace(',', '.'))
    if (!name.trim() || isNaN(parsed) || parsed <= 0) return

    const base = {
      name: name.trim(),
      type,
      amount: parsed,
      startDate,
      recurringPattern: recurring,
      category,
      endDate: endDate || undefined,
    }

    if (editTx && onUpdate) {
      onUpdate({ ...base, id: editTx.id })
    } else {
      onAdd(base)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 p-6 shadow-2xl border border-slate-700">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {editTx ? 'Edit transaction' : 'Add transaction'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-slate-700">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                type === 'expense'
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'income' ? 'e.g. Monthly salary' : 'e.g. Rent'}
              className="w-full rounded-lg bg-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Amount</label>
            <input
              required
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg bg-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-lg bg-slate-700 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          {/* Recurring */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Frequency</label>
            <select
              value={recurring}
              onChange={(e) => setRecurring(e.target.value as RecurringPattern)}
              className="w-full rounded-lg bg-slate-700 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(Object.keys(RECURRING_LABELS) as RecurringPattern[]).map((r) => (
                <option key={r} value={r}>
                  {RECURRING_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          {/* Start date */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              {recurring === 'none' ? 'Date' : 'Start date'}
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg bg-slate-700 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End date (only for recurring) */}
          {recurring !== 'none' && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                End date{' '}
                <span className="text-slate-500">(optional)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg bg-slate-700 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            {editTx ? 'Save changes' : 'Add transaction'}
          </button>
        </form>
      </div>
    </div>
  )
}
