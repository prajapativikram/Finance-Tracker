"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useExpenses } from "@/hooks/use-expenses"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

export function ExpenseForm() {
  const { addExpense } = useExpenses()
  const [amount, setAmount] = useState<string>("")
  const [category, setCategory] = useState<string>("Food")
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState<string>("")

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = Number.parseFloat(amount)
    if (isNaN(amt) || amt <= 0) return
    addExpense({
      amount: amt,
      category,
      date, // ISO yyyy-mm-dd
      note: note.trim() || undefined,
    })
    setAmount("")
    setNote("")
  }

  return (
    <form className="grid grid-cols-1 gap-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="amount">Amount (₹)</Label>
        <InputGroup>
          <InputGroupAddon aria-hidden="true">₹</InputGroupAddon>
          <InputGroupInput
            id="amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="e.g., 249.99"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Amount in rupees"
          />
        </InputGroup>
      </div>

      <div className="grid gap-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {["Food", "Transport", "Shopping", "Rent", "Utilities", "Health", "Entertainment", "Other"].map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Input
          id="note"
          placeholder="e.g., Lunch with friends"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full">
        Add Expense
      </Button>
    </form>
  )
}
