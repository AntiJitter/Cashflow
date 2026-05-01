import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { Transaction } from '../types'
import { formatCurrency, monthlyTotal } from '../utils/cashflow'

interface Props {
  transactions: Transaction[]
  currentBalance: number
  currency: string
  initialBalance: number
  onEditBalance: () => void
}

export function MonthlySummary({
  transactions,
  currentBalance,
  currency,
  onEditBalance,
}: Props) {
  const monthlyIncome = monthlyTotal(transactions, 'income')
  const monthlyExpenses = monthlyTotal(transactions, 'expense')
  const monthlySurplus = monthlyIncome - monthlyExpenses

  return (
    <div className="space-y-2">
      <button
        onClick={onEditBalance}
        className="group w-full rounded-xl bg-slate-800 p-4 text-left hover:bg-slate-750 transition-colors border border-slate-700 hover:border-blue-500/50"
      >
        <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-400">
          <Wallet size={13} />
          Current balance
          <span className="ml-auto text-xs text-slate-600 group-hover:text-slate-400">
            click to edit
          </span>
        </div>
        <div
          className={`text-2xl font-bold tabular-nums ${
            currentBalance >= 0 ? 'text-white' : 'text-red-400'
          }`}
        >
          {formatCurrency(currentBalance, currency)}
        </div>
      </button>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-800 p-3 border border-slate-700">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingUp size={12} className="text-emerald-400" />
            Monthly in
          </div>
          <div className="text-base font-semibold text-emerald-400 tabular-nums">
            {formatCurrency(monthlyIncome, currency)}
          </div>
        </div>

        <div className="rounded-xl bg-slate-800 p-3 border border-slate-700">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingDown size={12} className="text-red-400" />
            Monthly out
          </div>
          <div className="text-base font-semibold text-red-400 tabular-nums">
            {formatCurrency(monthlyExpenses, currency)}
          </div>
        </div>
      </div>

      <div
        className={`rounded-xl p-3 border ${
          monthlySurplus >= 0
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-red-500/10 border-red-500/20'
        }`}
      >
        <div className="mb-0.5 text-xs text-slate-400">Monthly surplus</div>
        <div
          className={`text-base font-bold tabular-nums ${
            monthlySurplus >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {monthlySurplus >= 0 ? '+' : ''}
          {formatCurrency(monthlySurplus, currency)}
        </div>
      </div>
    </div>
  )
}
