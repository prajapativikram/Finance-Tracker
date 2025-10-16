"use client"

import useSWR from "swr"

export type Expense = {
  id: string
  amount: number
  category: string
  date: string // yyyy-mm-dd
  note?: string
}

const STORAGE_KEY = "v0_finance_expenses"

function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Expense[]) : []
  } catch {
    return []
  }
}

function saveExpenses(expenses: Expense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
}

export function useExpenses() {
  const { data, mutate } = useSWR<Expense[]>("expenses", {
    fetcher: async () => loadExpenses(),
    fallbackData: [],
    revalidateOnFocus: false,
  })

  const addExpense = (e: Omit<Expense, "id">) => {
    const next: Expense[] = [...(data || []), { ...e, id: crypto.randomUUID() }]
    saveExpenses(next)
    mutate(next, false)
  }

  const removeExpense = (id: string) => {
    const next = (data || []).filter((e) => e.id !== id)
    saveExpenses(next)
    mutate(next, false)
  }

  const clearAll = () => {
    saveExpenses([])
    mutate([], false)
  }

  return {
    expenses: data || [],
    addExpense,
    removeExpense,
    clearAll,
  }
}
