"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = theme === "dark"
  return (
    <Button variant="secondary" size="sm" aria-label="Toggle theme" onClick={() => setTheme(isDark ? "light" : "dark")}>
      {isDark ? "Light" : "Dark"}
    </Button>
  )
}
