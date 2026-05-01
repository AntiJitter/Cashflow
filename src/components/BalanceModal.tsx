import { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  initialBalance: number
  currency: string
  onSave: (balance: number, currency: string) => void
  onClose: () => void
}

const CURRENCIES = ['NOK', 'SEK', 'DKK', 'EUR', 'USD', 'GBP', 'CHF']

export function BalanceModal({ initialBalance, currency, onSave, onClose }: Props) {
  const [balance, setBalance] = useState(String(initialBalance))
  const [cur, setCur] = useState(currency)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = parseFloat(balance.replace(',', '.').replace(/\s/g, ''))
    if (!isNaN(parsed)) {
      onSave(parsed, cur)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-slate-800 p-6 shadow-2xl border border-slate-700">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Account settings</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Current balance (today)
            </label>
            <input
              autoFocus
              type="number"
              step="any"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full rounded-lg bg-slate-700 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Enter your account balance as of today. The timeline will calculate forward and
              backward from this.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Currency</label>
            <select
              value={cur}
              onChange={(e) => setCur(e.target.value)}
              className="w-full rounded-lg bg-slate-700 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  )
}
