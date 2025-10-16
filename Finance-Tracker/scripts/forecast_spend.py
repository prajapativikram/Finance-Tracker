# Usage inside v0 Scripts tab: run this file (optionally set INPUT_CSV env var pointing to an attachment path)
# - Reads a CSV with columns: date (yyyy-mm-dd), amount (float)
# - Produces a 30-day forecast saved to scripts/output/forecast.csv and prints summary
# Requirements: pandas, prophet (cmds are handled by v0 scripts environment)
import os
import sys
import pandas as pd
from datetime import datetime
from pathlib import Path

def load_data():
  csv_path = os.environ.get("INPUT_CSV")
  if not csv_path:
    # Fallback: build a small synthetic dataset from the last 90 days
    today = pd.to_datetime("today").normalize()
    dates = pd.date_range(end=today, periods=90)
    amounts = pd.Series(500 + (pd.Series(range(90)) % 7) * 50).astype(float)  # weekly pattern
    df = pd.DataFrame({"date": dates, "amount": amounts})
    return df
  else:
    df = pd.read_csv(csv_path)
    # Expect 'date' and 'amount'
    if "date" not in df.columns or "amount" not in df.columns:
      raise ValueError("CSV must have 'date' and 'amount' columns.")
    return df

def prepare_prophet_df(df: pd.DataFrame):
  df = df.copy()
  df["date"] = pd.to_datetime(df["date"])
  daily = df.groupby("date", as_index=False)["amount"].sum()
  daily = daily.rename(columns={"date": "ds", "amount": "y"})
  return daily

def run_prophet(daily: pd.DataFrame):
  from prophet import Prophet
  m = Prophet(seasonality_mode="additive", weekly_seasonality=True)
  m.fit(daily)
  future = m.make_future_dataframe(periods=30)  # next 30 days
  forecast = m.predict(future)
  return forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]]

def main():
  print("[v0] Loading data…")
  df = load_data()
  daily = prepare_prophet_df(df)
  print(f"[v0] Training on {len(daily)} daily points from {daily['ds'].min().date()} to {daily['ds'].max().date()}")

  print("[v0] Running Prophet forecast…")
  forecast = run_prophet(daily)

  out_dir = Path(__file__).parent / "output"
  out_dir.mkdir(parents=True, exist_ok=True)
  out_path = out_dir / "forecast.csv"
  forecast.to_csv(out_path, index=False)
  print(f"[v0] Saved forecast to {out_path}")

  # Print a quick summary
  next_30_sum = forecast.tail(30)["yhat"].sum()
  print(f"[v0] Next 30-day projected spend: ₹{next_30_sum:,.2f}")

if __name__ == "__main__":
  try:
    main()
  except Exception as e:
    print(f"[v0] Error: {e}")
    sys.exit(1)
