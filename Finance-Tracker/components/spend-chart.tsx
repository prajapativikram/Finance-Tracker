"use client"

import { useMemo, useState } from "react"
import { useExpenses } from "@/hooks/use-expenses"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts"
import { Button } from "@/components/ui/button"
import { formatINR } from "@/lib/format"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Mode = "category" | "month"

export function SpendChart() {
  const { expenses } = useExpenses()
  const [mode, setMode] = useState<Mode>("month")

  const data = useMemo(() => {
    if (mode === "category") {
      const byCat = new Map<string, number>()
      for (const e of expenses) byCat.set(e.category, (byCat.get(e.category) || 0) + e.amount)
      return Array.from(byCat.entries()).map(([name, amount]) => ({ name, amount }))
    } else {
      const byMonth = new Map<string, number>()
      for (const e of expenses) {
        const m = e.date.slice(0, 7)
        byMonth.set(m, (byMonth.get(m) || 0) + e.amount)
      }
      return Array.from(byMonth.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, amount]) => ({ name, amount }))
    }
  }, [expenses, mode])

  const isEmpty = data.length === 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button size="sm" variant={mode === "month" ? "default" : "secondary"} onClick={() => setMode("month")}>
          By Month
        </Button>
        <Button size="sm" variant={mode === "category" ? "default" : "secondary"} onClick={() => setMode("category")}>
          By Category
        </Button>
      </div>

      <div className="h-64 w-full">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data yet.</div>
        ) : mode === "category" ? (
          <ChartContainer
            config={{ amount: { label: "Amount", color: "var(--color-chart-2)" } }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => formatINR(v)} width={90} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <ChartContainer
            config={{ amount: { label: "Amount", color: "var(--color-chart-1)" } }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => formatINR(v)} width={90} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="amount" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
