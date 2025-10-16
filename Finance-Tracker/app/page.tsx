import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { SpendChart } from "@/components/spend-chart"
import { AiInsights } from "@/components/ai-insights"
import { ThemeToggle } from "@/components/theme-toggle"
import { DashboardStats } from "@/components/dashboard-stats"

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">
            Your Personal  <span className="text-primary">Finance Tracker</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Track expenses in INR, visualize trends, and get personalized savings tips.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <section className="mb-6">
        <DashboardStats />
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-balance">Add Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseForm />
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-balance">Spending Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading chart…</div>}>
              <SpendChart />
            </Suspense>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-balance">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseList />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-balance">AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <AiInsights />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
