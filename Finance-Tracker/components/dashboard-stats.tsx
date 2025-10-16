"use client"

import { useMemo } from "react"
import { useExpenses } from "@/hooks/use-expenses"
import { Card, CardContent } from "@/components/ui/card"
import { formatINR } from "@/lib/format"

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="shadow-xs">
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 text-lg font-semibold">{value}</div>
        {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  const { expenses } = useExpenses()
  const { mtdTotal, topCat, avgDaily } = useMemo(() => {
    const now = new Date()
    const thisMonth = now.toISOString().slice(0, 7)
    const inMonth = expenses.filter((e) => e.date.slice(0, 7) === thisMonth)
    const mtdTotal = inMonth.reduce((s, e) => s + e.amount, 0)
    const byCat = new Map<string, number>()
    for (const e of inMonth) byCat.set(e.category, (byCat.get(e.category) || 0) + e.amount)
    const topCat = Array.from(byCat.entries()).sort((a, b) => b[1] - a[1])[0] || null

    const ms30 = 1000 * 60 * 60 * 24 * 30
    const cutoff = now.getTime() - ms30
    const last30 = expenses.filter((e) => new Date(e.date).getTime() >= cutoff)
    const sum30 = last30.reduce((s, e) => s + e.amount, 0)
    const avgDaily = sum30 / 30

    return { mtdTotal, topCat, avgDaily }
  }, [expenses])

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Stat label="This month spend" value={formatINR(mtdTotal)} />
      <Stat
        label="Top category"
        value={topCat ? `${topCat[0]} • ${formatINR(topCat[1])}` : "—"}
        hint={topCat ? "Try trimming ~10–15%" : undefined}
      />
      <Stat label="Avg daily (30d)" value={formatINR(avgDaily || 0)} />
    </div>
  )
}
