#!/usr/bin/env python3
"""
Weekly Swing Trading Screener — Admin use only.
Run from this directory: python screener.py
"""

import os
import math
import textwrap
import datetime
import warnings
import requests
import pandas as pd
import numpy as np
import yfinance as yf
from ta.momentum import RSIIndicator
from ta.trend import EMAIndicator
from ta.volatility import AverageTrueRange
import anthropic
from dotenv import load_dotenv

warnings.filterwarnings("ignore")
load_dotenv()

# ──────────────────────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────────────────────
PORTFOLIO_SIZE   = 8_000
RISK_PCT         = 0.015      # 1.5% of portfolio risked per trade
ATR_STOP_MULT    = 2.0        # stop = entry - 2x ATR
RR_RATIO         = 3.0        # target = entry + 3x (entry - stop)
TOP_N            = 10

MIN_VOLUME       = 1_000_000
MIN_PRICE        = 5.0
MAX_PRICE        = 150.0
ROC_PERIOD       = 20         # ~4 trading weeks
RSI_PERIOD       = 14
RSI_LOW          = 40
RSI_HIGH         = 65
EMA_PERIOD       = 21
EMA_BAND_PCT     = 2.0        # entry must be within +/-2% of 21-day EMA
ATR_PERIOD       = 14

TODAY            = datetime.date.today().strftime("%Y-%m-%d")
CLAUDE_MODEL     = "claude-opus-4-7"
MAX_BRIEF_TOKENS = 300

# System prompt cached across all 10 Claude calls (saves ~90% on calls 2-10)
BRIEF_SYSTEM = (
    "You are a concise swing trading analyst. Write honest, direct 3-5 sentence "
    "trade briefs in plain English. Cover: (1) whether the setup looks valid or "
    "weak overall, (2) what the recent price action from the last 10 closes "
    "suggests, and (3) one specific thing to watch after entry. Be direct and "
    "honest, including if the setup looks marginal or stretched. No bullet points."
)


# ──────────────────────────────────────────────────────────────────────────────
# 1. Fetch S&P 500 Universe from Wikipedia
# ──────────────────────────────────────────────────────────────────────────────
def get_sp500_tickers() -> list[str]:
    print("Fetching S&P 500 tickers from Wikipedia...")
    url  = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
    html = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15).text
    tickers = pd.read_html(html)[0]["Symbol"].tolist()
    # Yahoo Finance uses dashes instead of dots (e.g. BRK.B -> BRK-B)
    tickers = [t.replace(".", "-") for t in tickers]
    print(f"  {len(tickers)} tickers loaded.\n")
    return tickers


# ──────────────────────────────────────────────────────────────────────────────
# 2. Market Regime Filter: SPY must be above its 50-day SMA
# ──────────────────────────────────────────────────────────────────────────────
def market_is_bullish() -> bool:
    print("Checking market regime (SPY vs 50-day SMA)...")
    spy = yf.download("SPY", period="3mo", interval="1d",
                      auto_adjust=True, progress=False)
    if isinstance(spy.columns, pd.MultiIndex):
        spy.columns = spy.columns.get_level_values(0)

    if spy.empty or len(spy) < 50:
        print("  Not enough SPY data; skipping regime check.\n")
        return True

    close      = spy["Close"].squeeze()
    latest     = float(close.iloc[-1])
    sma50      = float(close.rolling(50).mean().iloc[-1])
    is_bullish = latest > sma50

    print(f"  SPY close: ${latest:.2f}  |  50-day SMA: ${sma50:.2f}")
    if is_bullish:
        print("  Regime: bullish. Proceeding.\n")
    else:
        print("\n  WARNING: SPY is below its 50-day SMA.")
        print("  Bearish regime. No setups returned.\n")
    return is_bullish


# ──────────────────────────────────────────────────────────────────────────────
# 3. Analyze a Single Ticker
# ──────────────────────────────────────────────────────────────────────────────
def analyze(ticker: str) -> dict | None:
    df = yf.download(ticker, period="6mo", interval="1d",
                     auto_adjust=True, progress=False)

    # Newer yfinance returns MultiIndex columns even for a single ticker
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    min_rows = max(ROC_PERIOD, RSI_PERIOD, EMA_PERIOD, ATR_PERIOD) + 5
    if df.empty or len(df) < min_rows:
        return None

    close  = df["Close"].squeeze()
    volume = df["Volume"].squeeze()
    high   = df["High"].squeeze()
    low    = df["Low"].squeeze()

    price   = float(close.iloc[-1])
    avg_vol = float(volume.iloc[-20:].mean())

    # Filter: average daily volume > 1M shares
    if avg_vol < MIN_VOLUME:
        return None

    # Filter: price between $5 and $150
    if not (MIN_PRICE <= price <= MAX_PRICE):
        return None

    # TODO: skip stocks with earnings within 5 trading days
    # Requires an earnings calendar API; not yet implemented.

    # Filter: 4-week ROC must be positive
    if len(close) <= ROC_PERIOD:
        return None
    base = float(close.iloc[-(ROC_PERIOD + 1)])
    roc  = (price - base) / base * 100
    if roc <= 0:
        return None

    # Filter: RSI(14) must be between 40 and 65
    rsi_series = RSIIndicator(close=close, window=RSI_PERIOD).rsi()
    rsi_val    = float(rsi_series.iloc[-1])
    if pd.isna(rsi_val) or not (RSI_LOW <= rsi_val <= RSI_HIGH):
        return None

    # Filter: close must be within 2% of the 21-day EMA
    ema_series = EMAIndicator(close=close, window=EMA_PERIOD).ema_indicator()
    ema_val    = float(ema_series.iloc[-1])
    if pd.isna(ema_val):
        return None
    ema_dist = (price - ema_val) / ema_val * 100
    if abs(ema_dist) > EMA_BAND_PCT:
        return None

    # Calculations: ATR, stop, position size, target
    atr_val = float(
        AverageTrueRange(high=high, low=low, close=close, window=ATR_PERIOD)
        .average_true_range().iloc[-1]
    )
    if pd.isna(atr_val) or atr_val <= 0:
        return None

    stop_loss      = price - ATR_STOP_MULT * atr_val
    risk_per_share = price - stop_loss
    shares         = math.floor((PORTFOLIO_SIZE * RISK_PCT) / risk_per_share) if risk_per_share > 0 else 0
    target         = price + RR_RATIO * risk_per_share
    risk_dollars   = shares * risk_per_share
    last_10        = [round(float(c), 2) for c in close.iloc[-10:].tolist()]

    return {
        "ticker":         ticker,
        "price":          round(price, 2),
        "roc_pct":        round(roc, 2),
        "rsi":            round(rsi_val, 1),
        "ema":            round(ema_val, 2),
        "ema_dist_pct":   round(ema_dist, 2),
        "atr":            round(atr_val, 2),
        "stop_loss":      round(stop_loss, 2),
        "target":         round(target, 2),
        "shares":         shares,
        "risk_dollars":   round(risk_dollars, 2),
        "avg_volume":     int(avg_vol),
        "last_10_closes": last_10,
    }


# ──────────────────────────────────────────────────────────────────────────────
# 4. Screen Every Ticker in the Universe
# ──────────────────────────────────────────────────────────────────────────────
def screen(tickers: list[str]) -> list[dict]:
    total  = len(tickers)
    setups = []
    for i, ticker in enumerate(tickers, 1):
        print(f"  [{i:>3}/{total}] {ticker:<6}", end="\r")
        try:
            result = analyze(ticker)
            if result:
                setups.append(result)
        except Exception:
            pass
    print(f"\n  Screening complete. {len(setups)} stocks passed all filters.\n")
    return setups


# ──────────────────────────────────────────────────────────────────────────────
# 5. Print a Formatted Results Table
# ──────────────────────────────────────────────────────────────────────────────
def print_table(setups: list[dict]) -> None:
    w = 84
    row = "  {:<3} {:<6} {:>8} {:>8} {:>6} {:>8} {:>7} {:>7} {:>8} {:>9} {:>7} {:>8}"
    print("=" * w)
    print(f"  TOP SWING TRADE SETUPS  |  {TODAY}")
    print("=" * w)
    print(row.format(
        "#", "TICKER", "PRICE", "ROC%", "RSI", "EMA",
        "DIST%", "ATR", "STOP", "TARGET", "SHARES", "RISK$"
    ))
    print("  " + "-" * (w - 2))
    for rank, s in enumerate(setups, 1):
        print(row.format(
            rank,
            s["ticker"],
            f"${s['price']:.2f}",
            f"{s['roc_pct']:+.2f}%",
            f"{s['rsi']:.1f}",
            f"${s['ema']:.2f}",
            f"{s['ema_dist_pct']:+.2f}%",
            f"${s['atr']:.2f}",
            f"${s['stop_loss']:.2f}",
            f"${s['target']:.2f}",
            s["shares"],
            f"${s['risk_dollars']:.2f}",
        ))
    print("  " + "-" * (w - 2) + "\n")


# ──────────────────────────────────────────────────────────────────────────────
# 6. Save Setups and Briefs to Dated CSV Files
# ──────────────────────────────────────────────────────────────────────────────
def save_setups_csv(setups: list[dict]) -> str:
    fname = f"setups_{TODAY}.csv"
    pd.DataFrame(setups).to_csv(fname, index=False)
    print(f"  Setups saved: {fname}")
    return fname


def save_briefs_csv(setups: list[dict]) -> str:
    fname = f"briefs_{TODAY}.csv"
    rows  = [
        {
            "ticker":  s["ticker"],
            "price":   s["price"],
            "stop":    s["stop_loss"],
            "target":  s["target"],
            "shares":  s["shares"],
            "brief":   s.get("brief", ""),
        }
        for s in setups
    ]
    pd.DataFrame(rows).to_csv(fname, index=False)
    print(f"  Briefs saved:  {fname}\n")
    return fname


# ──────────────────────────────────────────────────────────────────────────────
# 7. Claude AI Trade Briefs with Prompt Caching
#    The system prompt is identical for all 10 calls, so it is cached after
#    the first request and served at ~10% of normal input cost for calls 2-10.
# ──────────────────────────────────────────────────────────────────────────────
def generate_brief(client: anthropic.Anthropic, setup: dict) -> str:
    user_msg = (
        f"Ticker: {setup['ticker']}\n"
        f"Entry: ${setup['price']:.2f}  |  "
        f"Stop: ${setup['stop_loss']:.2f}  |  "
        f"Target: ${setup['target']:.2f}  |  "
        f"Shares: {setup['shares']}  |  "
        f"Risk: ${setup['risk_dollars']:.2f}\n"
        f"4-Week ROC: {setup['roc_pct']:+.2f}%  |  "
        f"RSI(14): {setup['rsi']:.1f}  |  "
        f"21-day EMA: ${setup['ema']:.2f} ({setup['ema_dist_pct']:+.2f}%)  |  "
        f"ATR(14): ${setup['atr']:.2f}\n"
        f"Last 10 daily closes: {setup['last_10_closes']}"
    )

    msg = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=MAX_BRIEF_TOKENS,
        output_config={"effort": "medium"},
        system=[{
            "type": "text",
            "text": BRIEF_SYSTEM,
            "cache_control": {"type": "ephemeral"},
        }],
        messages=[{"role": "user", "content": user_msg}],
    )
    return msg.content[0].text.strip()


def run_briefs(setups: list[dict]) -> list[dict]:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("  ANTHROPIC_API_KEY not found in .env; skipping briefs.\n")
        for s in setups:
            s["brief"] = "API key not configured."
        return setups

    client = anthropic.Anthropic(api_key=api_key)
    w      = 84

    print("=" * w)
    print("  CLAUDE TRADE BRIEFS")
    print("=" * w + "\n")

    for s in setups:
        header = (
            f"  {s['ticker']}  |  "
            f"Entry ${s['price']}  "
            f"Stop ${s['stop_loss']}  "
            f"Target ${s['target']}  "
            f"Shares {s['shares']}"
        )
        print(header)
        print("  " + "-" * (len(header) - 2))
        try:
            brief    = generate_brief(client, s)
            s["brief"] = brief
            wrapped  = textwrap.fill(
                brief, width=80,
                initial_indent="  ",
                subsequent_indent="  ",
            )
            print(wrapped)
        except Exception as e:
            print(f"  Error calling Claude: {e}")
            s["brief"] = "Analysis unavailable."
            print("  Analysis unavailable.")
        print()

    return setups


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────
def main() -> None:
    w = 84
    print(f"\n{'=' * w}")
    print(f"  WEEKLY SWING SCREENER  |  {TODAY}")
    print(f"{'=' * w}\n")

    tickers = get_sp500_tickers()

    if not market_is_bullish():
        return

    print(f"Screening {len(tickers)} S&P 500 tickers (this takes a few minutes)...")
    setups = screen(tickers)

    if not setups:
        print("No setups passed all filters this week. Try again next week.")
        return

    # Rank by 4-week ROC descending, keep top N
    setups.sort(key=lambda x: x["roc_pct"], reverse=True)
    top = setups[:TOP_N]

    print_table(top)

    print("Saving results...")
    save_setups_csv(top)

    top = run_briefs(top)
    save_briefs_csv(top)

    print("Done.\n")


if __name__ == "__main__":
    main()
