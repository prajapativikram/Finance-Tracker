"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useExpenses } from "@/hooks/use-expenses"
import { formatINR } from "@/lib/format"
import { cn } from "@/lib/utils"

export function ExpenseList() {
  const { expenses, removeExpense, clearAll } = useExpenses()
  const [filterMonth, setFilterMonth] = useState<string>("")
  const [filterCategory, setFilterCategory] = useState<string>("")
  const [search, setSearch] = useState<string>("")

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const inMonth = filterMonth ? e.date.slice(0, 7) === filterMonth : true
      const inCat = filterCategory ? e.category === filterCategory : true
      const inSearch = search ? (e.note || "").toLowerCase().includes(search.toLowerCase()) : true
      return inMonth && inCat && inSearch
    })
  }, [expenses, filterMonth, filterCategory, search])

  const total = filtered.reduce((sum, e) => sum + e.amount, 0)

  const exportCSV = () => {
    const header = ["id", "date", "category", "amount", "note"]
    const rows = filtered.map((e) => [e.id, e.date, e.category, e.amount, e.note || ""])
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `expenses_${filterMonth || "all"}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const months = Array.from(new Set(expenses.map((e) => e.date.slice(0, 7))))
    .sort()
    .reverse()
  const categories = Array.from(new Set(expenses.map((e) => e.category))).sort()

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="grid gap-1">
          <Label>Month</Label>
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">All</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <Label>Category</Label>
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 grid gap-1 md:col-span-2">
          <Label htmlFor="search">Search notes</Label>
          <Input id="search" placeholder="e.g., coffee" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div
        className={cn(
          "flex items-center justify-between rounded-md border p-3",
          "bg-secondary text-secondary-foreground",
        )}
      >
        <span className="text-sm font-medium">Total</span>
        <span className="text-base font-semibold">{formatINR(total)}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="py-2 text-left">Date</th>
              <th className="py-2 text-left">Category</th>
              <th className="py-2 text-right">Amount</th>
              <th className="py-2 text-left">Note</th>
              <th className="py-2 text-right" aria-label="actions"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="py-2">{e.date}</td>
                <td className="py-2">{e.category}</td>
                <td className="py-2 text-right">{formatINR(e.amount)}</td>
                <td className="py-2">{e.note}</td>
                <td className="py-2 text-right">
                  <Button variant="ghost" size="sm" onClick={() => removeExpense(e.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">
                  No expenses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={exportCSV}>
          Export CSV
        </Button>
        <Button variant="destructive" onClick={clearAll}>
          Clear All
        </Button>
      </div>
    </div>
  )
}
