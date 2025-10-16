export function formatINR(n: number) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n)
  } catch {
    return `₹${n.toFixed(2)}`
  }
}
