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

export function MonthlySummary({ transactions, currentBalance, currency, onEditBalance }: Props) {
  const monthlyIncome = monthlyTotal(transactions, 'income')
  const monthlyExpenses = monthlyTotal(transactions, 'expense')
  const monthlySurplus = monthlyIncome - monthlyExpenses

  return (
    <div className="space-y-2">
      <button
        onClick={onEditBalance}
        className="group w-full rounded-2xl p-4 text-left transition-all"
        style={{
          background: '#2C2C2E',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0A84FF44' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
      >
        <div className="mb-1 flex items-center gap-2 text-xs font-medium" style={{ color: '#8E8E93' }}>
          <Wallet size={13} />
          Current balance
          <span className="ml-auto text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#636366' }}>
            click to edit
          </span>
        </div>
        <div
          className="text-2xl font-bold tabular-nums"
          style={{ color: currentBalance >= 0 ? '#FFFFFF' : '#FF453A' }}
        >
          {formatCurrency(currentBalance, currency)}
        </div>
      </button>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl p-3" style={{ background: '#2C2C2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mb-1 flex items-center gap-1.5 text-xs" style={{ color: '#8E8E93' }}>
            <TrendingUp size={12} style={{ color: '#30D158' }} />
            Monthly in
          </div>
          <div className="text-base font-semibold tabular-nums" style={{ color: '#30D158' }}>
            {formatCurrency(monthlyIncome, currency)}
          </div>
        </div>

        <div className="rounded-2xl p-3" style={{ background: '#2C2C2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mb-1 flex items-center gap-1.5 text-xs" style={{ color: '#8E8E93' }}>
            <TrendingDown size={12} style={{ color: '#FF453A' }} />
            Monthly out
          </div>
          <div className="text-base font-semibold tabular-nums" style={{ color: '#FF453A' }}>
            {formatCurrency(monthlyExpenses, currency)}
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl p-3"
        style={{
          background: monthlySurplus >= 0 ? 'rgba(48,209,88,0.1)' : 'rgba(255,69,58,0.1)',
          border: `1px solid ${monthlySurplus >= 0 ? 'rgba(48,209,88,0.2)' : 'rgba(255,69,58,0.2)'}`,
        }}
      >
        <div className="mb-0.5 text-xs" style={{ color: '#8E8E93' }}>Monthly surplus</div>
        <div
          className="text-base font-bold tabular-nums"
          style={{ color: monthlySurplus >= 0 ? '#30D158' : '#FF453A' }}
        >
          {monthlySurplus >= 0 ? '+' : ''}
          {formatCurrency(monthlySurplus, currency)}
        </div>
      </div>
    </div>
  )
}
