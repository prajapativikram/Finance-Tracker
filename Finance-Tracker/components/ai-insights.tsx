"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useExpenses } from "@/hooks/use-expenses"
import { formatINR } from "@/lib/format"

type InsightResponse = { tips: string }

export function AiInsights() {
  const { expenses } = useExpenses()
  const [income, setIncome] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tips, setTips] = useState<string>("")

  const summary = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0)
    const byCategory: Record<string, number> = {}
    for (const e of expenses) byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
    const months = Array.from(new Set(expenses.map((e) => e.date.slice(0, 7)))).sort()
    const byMonth: Record<string, number> = {}
    for (const m of months)
      byMonth[m] = expenses.filter((e) => e.date.slice(0, 7) === m).reduce((s, e) => s + e.amount, 0)
    return { total, byCategory, byMonth }
  }, [expenses])

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setTips("")
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          monthlyIncome: income ? Number.parseFloat(income) : undefined,
          currency: "INR",
        }),
      })
      if (!res.ok) throw new Error("Failed to generate insights")
      const data = (await res.json()) as InsightResponse
      setTips(data.tips)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2">
        <Label htmlFor="income">Monthly Income (₹)</Label>
        <Input
          id="income"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="e.g., 60000"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Used to tailor savings rate and budget allocations.</p>
      </div>

      <div className="rounded-md border p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total spend</span>
          <span className="font-medium">{formatINR(summary.total)}</span>
        </div>
      </div>

      <Button onClick={handleGenerate} disabled={loading || expenses.length === 0}>
        {loading ? "Generating..." : "Get AI Tips"}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {tips && (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: tips }} />
        </div>
      )}
      {!tips && !loading && expenses.length === 0 && (
        <p className="text-sm text-muted-foreground">Add a few expenses to get personalized tips.</p>
      )}
    </div>
  )
}
