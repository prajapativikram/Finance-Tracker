import { type NextRequest, NextResponse } from "next/server"

// Local tip generator (no external calls)
function formatCurrency(n: number, symbol: string) {
  return `${symbol}${Math.round(n).toLocaleString("en-IN")}`
}

function buildLocalTips(params: {
  total: number
  byCategory: Record<string, number>
  byMonth: Record<string, number>
  monthlyIncome?: number
  currencySymbol: string
}): string {
  const { total, byCategory, byMonth, monthlyIncome, currencySymbol } = params

  const cats = Object.entries(byCategory).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
  const top1 = cats[0]
  const top2 = cats[1]

  const months = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0]))
  const last = months[months.length - 1]?.[1] ?? 0
  const prev = months[months.length - 2]?.[1] ?? 0
  const delta = last - prev

  const tips: string[] = []

  // Tip 1: save X by reducing top category by ~15%
  if (top1) {
    const save = Math.max(0, top1[1] * 0.15)
    tips.push(`Save ${formatCurrency(save, currencySymbol)} by reducing ${top1[0]} ~15%.`)
  }

  // Tip 2: save X by reducing second category by ~10% (fallback to top if missing)
  if (top2) {
    const save = Math.max(0, top2[1] * 0.1)
    tips.push(`Save ${formatCurrency(save, currencySymbol)} by trimming ${top2[0]} ~10%.`)
  } else if (top1) {
    const save = Math.max(0, top1[1] * 0.05)
    tips.push(`Save ${formatCurrency(save, currencySymbol)} by small cuts in ${top1[0]} (~5%).`)
  }

  // Tip 3: savings automation recommendation if income provided
  if (monthlyIncome && Number.isFinite(monthlyIncome)) {
    const targetSave = monthlyIncome * 0.2
    tips.push(`Auto-transfer ${formatCurrency(targetSave, currencySymbol)} (20% of income) to savings at month start.`)
  } else {
    tips.push(`Allocate budgets by category and set monthly caps to prevent overspending.`)
  }

  // Tip 4: discretionary cap per day
  if (monthlyIncome && Number.isFinite(monthlyIncome)) {
    const wantsBudget = monthlyIncome * 0.3
    const dailyCap = wantsBudget / 30
    tips.push(`Set a daily discretionary cap near ${formatCurrency(dailyCap, currencySymbol)} to curb impulse buys.`)
  } else {
    const dailyCap = total / 30 || 0
    tips.push(`Aim for a daily spend near ${formatCurrency(dailyCap, currencySymbol)} based on recent totals.`)
  }

  // Tip 5: recent trend check
  if (months.length >= 2 && delta > 0) {
    const risePct = prev > 0 ? Math.round((delta / prev) * 100) : 0
    tips.push(
      `Last month rose by ${risePct}%—cap this month’s spend at ${formatCurrency(Math.max(prev, 0), currencySymbol)}.`,
    )
  } else {
    const cap = months.length ? Math.max(...months.map((m) => m[1] ?? 0)) : total
    tips.push(`Keep this month under ${formatCurrency(cap, currencySymbol)} using weekly check-ins.`)
  }

  // Ensure brevity and output HTML list
  const short = tips.map((t) => (t.length > 180 ? `${t.slice(0, 177)}…` : t))
  return `<ul>${short.map((t) => `<li>${t}</li>`).join("")}</ul>`
}

export async function POST(req: NextRequest) {
  try {
    const { summary, monthlyIncome, currency } = await req.json()

    // Defensive shaping
    const safeSummary = {
      total: Number(summary?.total || 0),
      byCategory: summary?.byCategory || {},
      byMonth: summary?.byMonth || {},
    }
    const currencySymbol = currency === "INR" ? "₹" : currency ? "" : "₹"

    // Generate tips locally instead of calling generateText/AI Gateway
    const tipsHtml = buildLocalTips({
      total: safeSummary.total,
      byCategory: safeSummary.byCategory,
      byMonth: safeSummary.byMonth,
      monthlyIncome: typeof monthlyIncome === "number" ? monthlyIncome : undefined,
      currencySymbol,
    })

    return NextResponse.json({ tips: tipsHtml })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "failed" }, { status: 500 })
  }
}
