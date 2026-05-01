import { useState, useCallback } from 'react'
import { Transaction } from '../types'

const STORAGE_KEY = 'cashflow_transactions'
const BALANCE_KEY = 'cashflow_initial_balance'
const CURRENCY_KEY = 'cashflow_currency'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    load<Transaction[]>(STORAGE_KEY, []),
  )
  const [initialBalance, setInitialBalance] = useState<number>(() =>
    load<number>(BALANCE_KEY, 0),
  )
  const [currency, setCurrency] = useState<string>(() => load<string>(CURRENCY_KEY, 'NOK'))

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...tx, id: crypto.randomUUID() }
    setTransactions((prev) => {
      const next = [...prev, newTx]
      save(STORAGE_KEY, next)
      return next
    })
  }, [])

  const removeTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const next = prev.filter((tx) => tx.id !== id)
      save(STORAGE_KEY, next)
      return next
    })
  }, [])

  const updateTransaction = useCallback((updated: Transaction) => {
    setTransactions((prev) => {
      const next = prev.map((tx) => (tx.id === updated.id ? updated : tx))
      save(STORAGE_KEY, next)
      return next
    })
  }, [])

  const updateBalance = useCallback((balance: number) => {
    setInitialBalance(balance)
    save(BALANCE_KEY, balance)
  }, [])

  const updateCurrency = useCallback((c: string) => {
    setCurrency(c)
    save(CURRENCY_KEY, c)
  }, [])

  return {
    transactions,
    initialBalance,
    currency,
    addTransaction,
    removeTransaction,
    updateTransaction,
    updateBalance,
    updateCurrency,
  }
}
