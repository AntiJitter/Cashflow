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
    <div className="flex h-screen flex-col overflow-hidden" style={{ background: '#111113', color: '#FFFFFF' }}>
      {/* Header */}
      <header
        className="flex flex-shrink-0 items-center justify-between px-6 py-3.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(28,28,30,0.9)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: '#0A84FF' }}
          >
            <BarChart3 size={15} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight">CashFlow</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBalanceModal(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors"
            style={{ color: '#8E8E93' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8E8E93'; e.currentTarget.style.background = 'transparent' }}
          >
            <Settings size={14} />
            Settings
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-sm font-semibold text-white transition-all"
            style={{ background: '#0A84FF' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#409CFF' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#0A84FF' }}
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className="flex w-80 flex-shrink-0 flex-col overflow-hidden"
          style={{ borderRight: '1px solid rgba(255,255,255,0.07)', background: '#1C1C1E' }}
        >
          {/* Sidebar tabs */}
          <div
            className="flex"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            {(['summary', 'transactions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors relative"
                style={{
                  color: sidebarTab === tab ? '#0A84FF' : '#636366',
                  borderBottom: sidebarTab === tab ? '2px solid #0A84FF' : '2px solid transparent',
                }}
              >
                {tab === 'transactions' ? (
                  <>
                    Transactions
                    {transactions.length > 0 && (
                      <span
                        className="ml-1.5 rounded-full px-1.5 py-0.5"
                        style={{ background: '#3A3A3C', color: '#8E8E93', fontSize: 10 }}
                      >
                        {transactions.length}
                      </span>
                    )}
                  </>
                ) : (
                  'Summary'
                )}
              </button>
            ))}
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
            <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button
                onClick={() => setShowForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm transition-colors"
                style={{
                  border: '1px dashed rgba(255,255,255,0.12)',
                  color: '#636366',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0A84FF55'; e.currentTarget.style.color = '#0A84FF' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#636366' }}
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
              <div
                className="rounded-3xl p-10 max-w-sm"
                style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <BarChart3 size={40} className="mx-auto mb-4" style={{ color: '#3A3A3C' }} />
                <h2 className="mb-2 text-lg font-semibold">Your timeline awaits</h2>
                <p className="mb-6 text-sm" style={{ color: '#8E8E93' }}>
                  Add your salary and recurring payments to see your cash flow visualized across
                  time.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white transition-all"
                  style={{ background: '#0A84FF' }}
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
