import { useState, useMemo } from 'react'
import { Plus, BarChart3, Settings } from 'lucide-react'
import { addDays, startOfDay, subDays } from 'date-fns'
import { useTransactions } from './hooks/useTransactions'
import { Timeline } from './components/Timeline'
import { TransactionForm } from './components/TransactionForm'
import { TransactionList } from './components/TransactionList'
import { MonthlySummary } from './components/MonthlySummary'
import { BalanceModal } from './components/BalanceModal'
import { generateDayData } from './utils/cashflow'

type SidebarTab = 'summary' | 'transactions'

export default function App() {
  const {
    transactions,
    initialBalance,
    currency,
    addTransaction,
    removeTransaction,
    updateTransaction,
    updateBalance,
    updateCurrency,
  } = useTransactions()

  const [showForm, setShowForm] = useState(false)
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('summary')

  const today = startOfDay(new Date())

  const currentDayData = useMemo(() => {
    const data = generateDayData(
      transactions,
      subDays(today, 1),
      addDays(today, 1),
      initialBalance,
      today,
    )
    return data.find((d) => d.isToday)
  }, [transactions, initialBalance, today])

  const currentBalance = currentDayData?.balance ?? initialBalance

  const hasData = transactions.length > 0

  return (
    <div className="flex h-screen flex-col bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-slate-800 px-6 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <BarChart3 size={15} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">CashFlow</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBalanceModal(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Settings size={14} />
            Settings
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex w-80 flex-shrink-0 flex-col border-r border-slate-800 overflow-hidden">
          {/* Sidebar tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setSidebarTab('summary')}
              className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                sidebarTab === 'summary'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setSidebarTab('transactions')}
              className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                sidebarTab === 'transactions'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Transactions
              {transactions.length > 0 && (
                <span className="ml-1.5 rounded-full bg-slate-700 px-1.5 py-0.5 text-slate-400">
                  {transactions.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {sidebarTab === 'summary' && (
              <MonthlySummary
                transactions={transactions}
                currentBalance={currentBalance}
                currency={currency}
                initialBalance={initialBalance}
                onEditBalance={() => setShowBalanceModal(true)}
              />
            )}
            {sidebarTab === 'transactions' && (
              hasData ? (
                <TransactionList
                  transactions={transactions}
                  currency={currency}
                  onRemove={removeTransaction}
                  onUpdate={updateTransaction}
                />
              ) : (
                <EmptyState onAdd={() => setShowForm(true)} />
              )
            )}
          </div>

          {sidebarTab === 'summary' && hasData && (
            <div className="border-t border-slate-800 p-4">
              <button
                onClick={() => setShowForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 py-2.5 text-sm text-slate-500 hover:border-blue-500/50 hover:text-blue-400 transition-colors"
              >
                <Plus size={14} />
                Add transaction
              </button>
            </div>
          )}
        </aside>

        {/* Main timeline */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {hasData ? (
            <Timeline
              transactions={transactions}
              initialBalance={initialBalance}
              currency={currency}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-2xl bg-slate-800/50 p-8 max-w-sm">
                <BarChart3 size={40} className="mx-auto mb-4 text-slate-600" />
                <h2 className="mb-2 text-lg font-semibold text-white">Your timeline awaits</h2>
                <p className="mb-6 text-sm text-slate-400">
                  Add your salary and recurring payments to see your cash flow visualized across
                  time.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  <Plus size={15} />
                  Add first transaction
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showForm && (
        <TransactionForm onAdd={addTransaction} onClose={() => setShowForm(false)} />
      )}
      {showBalanceModal && (
        <BalanceModal
          initialBalance={initialBalance}
          currency={currency}
          onSave={(balance, cur) => {
            updateBalance(balance)
            updateCurrency(cur)
          }}
          onClose={() => setShowBalanceModal(false)}
        />
      )}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <p className="mb-4 text-sm text-slate-500">No transactions yet</p>
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
      >
        <Plus size={14} />
        Add transaction
      </button>
    </div>
  )
}
