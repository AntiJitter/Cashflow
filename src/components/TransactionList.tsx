import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import {
  Transaction,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  RECURRING_LABELS,
} from '../types'
import { formatCurrency } from '../utils/cashflow'
import { TransactionForm } from './TransactionForm'

interface Props {
  transactions: Transaction[]
  currency: string
  onRemove: (id: string) => void
  onUpdate: (tx: Transaction) => void
}

export function TransactionList({ transactions, currency, onRemove, onUpdate }: Props) {
  const [editTx, setEditTx] = useState<Transaction | null>(null)

  const income = transactions.filter((t) => t.type === 'income')
  const expenses = transactions.filter((t) => t.type === 'expense')

  return (
    <div className="space-y-4">
      {editTx && (
        <TransactionForm
          editTx={editTx}
          onClose={() => setEditTx(null)}
          onAdd={() => {}}
          onUpdate={(tx) => {
            onUpdate(tx)
            setEditTx(null)
          }}
        />
      )}

      <Section
        title="Income"
        items={income}
        currency={currency}
        onEdit={setEditTx}
        onRemove={onRemove}
      />
      <Section
        title="Expenses"
        items={expenses}
        currency={currency}
        onEdit={setEditTx}
        onRemove={onRemove}
      />
    </div>
  )
}

function Section({
  title,
  items,
  currency,
  onEdit,
  onRemove,
}: {
  title: string
  items: Transaction[]
  currency: string
  onEdit: (tx: Transaction) => void
  onRemove: (id: string) => void
}) {
  if (items.length === 0) return null

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#636366' }}>
        {title}
      </h3>
      <div className="space-y-1.5">
        {items.map((tx) => (
          <div
            key={tx.id}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
            style={{ background: '#2C2C2E' }}
          >
            <div
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[tx.category] }}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{tx.name}</div>
              <div className="text-xs" style={{ color: '#636366' }}>
                {CATEGORY_LABELS[tx.category]} · {RECURRING_LABELS[tx.recurringPattern]}
              </div>
            </div>
            <div
              className="text-sm font-semibold tabular-nums"
              style={{ color: tx.type === 'income' ? '#30D158' : '#FF453A' }}
            >
              {tx.type === 'income' ? '+' : '−'}
              {formatCurrency(tx.amount, currency)}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(tx)}
                className="rounded p-1 transition-colors"
                style={{ color: '#636366' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#636366' }}
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onRemove(tx.id)}
                className="rounded p-1 transition-colors"
                style={{ color: '#636366' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#FF453A' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#636366' }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
