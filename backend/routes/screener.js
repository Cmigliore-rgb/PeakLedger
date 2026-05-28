const express = require('express');
const router  = express.Router();
const requireAuth = require('../middleware/requireAuth');
const db = require('../db');
const axios = require('axios');
const YahooFinanceClass = require('yahoo-finance2').default;
const yahooFinance = new YahooFinanceClass();
const { RSI, EMA, ATR } = require('technicalindicators');
const { load: cheerioLoad } = require('cheerio');
const Anthropic = require('@anthropic-ai/sdk');

// ── DB: ensure screener_results table exists ──────────────────────────────────
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS screener_results (
      id          INTEGER PRIMARY KEY DEFAULT 1,
      run_date    TEXT,
      status      TEXT DEFAULT 'idle',
      regime_bullish INTEGER,
      spy_close   REAL,
      sma50       REAL,
      setups      TEXT DEFAULT '[]',
      message     TEXT DEFAULT '',
      updated_at  TEXT DEFAULT (datetime('now'))
    )
  `);
  db.prepare('INSERT OR IGNORE INTO screener_results (id) VALUES (1)').run();
} catch (e) {
  console.warn('[screener] table init:', e.message);
}

// ── Configuration ─────────────────────────────────────────────────────────────
const PORTFOLIO_SIZE = 8_000;
const RISK_PCT       = 0.015;
const ATR_STOP_MULT  = 2.0;
const RR_RATIO       = 3.0;
const TOP_N          = 10;
const MIN_VOLUME     = 1_000_000;
const MIN_PRICE      = 5.0;
const MAX_PRICE      = 150.0;
const ROC_PERIOD     = 20;
const RSI_PERIOD     = 14;
const RSI_LOW        = 40;
const RSI_HIGH       = 65;
const EMA_PERIOD     = 21;
const EMA_BAND_PCT   = 2.0;
const ATR_PERIOD     = 14;
const CONCURRENCY    = 20;

// System prompt cached across all 10 Claude calls via cache_control
const BRIEF_SYSTEM =
  'You are a concise swing trading analyst. Write honest, direct 3-5 sentence trade briefs in plain English. ' +
  'Cover: (1) whether the setup looks valid or weak overall, (2) what the recent price action from the last 10 closes suggests, ' +
  'and (3) one specific thing to watch after entry. Be direct and honest, including if the setup looks marginal. No bullet points.';

// ── In-memory job state (single admin, fire-and-forget) ───────────────────────
let job = { running: false, progress: 0, total: 500, phase: '', error: null };

// ── Helpers ───────────────────────────────────────────────────────────────────
const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

// Fetch current S&P 500 tickers from Wikipedia
async function fetchSP500Tickers() {
  const { data: html } = await axios.get(
    'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies',
    { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PeakLedger/1.0)' }, timeout: 20_000 }
  );
  const $ = cheerioLoad(html);
  const tickers = [];

  // Try known table ID first, then fall back to class selectors
  let rows = $('#constituents tbody tr');
  if (!rows.length) rows = $('table.wikitable.sortable').first().find('tbody tr');
  if (!rows.length) rows = $('table.wikitable').first().find('tbody tr');

  rows.each((_, row) => {
    const raw = $(row).find('td').first().text().trim().replace(/\./g, '-');
    // Tickers are 1-5 uppercase letters (+ optional dash suffix like BRK-B)
    if (/^[A-Z]{1,5}(-[A-Z]{1,2})?$/.test(raw)) tickers.push(raw);
  });

  if (tickers.length < 400) {
    throw new Error(`Wikipedia scrape returned only ${tickers.length} tickers (expected ~500). Page structure may have changed.`);
  }
  return tickers;
}

// Check SPY vs its 50-day SMA to confirm bullish market regime
async function checkRegime() {
  const since = new Date();
  since.setMonth(since.getMonth() - 3);
  const spy = await yahooFinance.chart('SPY', { period1: since, interval: '1d' });
  const closes = (spy.quotes || []).filter(q => q.close != null).map(q => q.close);
  if (closes.length < 50) return { bullish: true, spyClose: null, sma50: null };
  const sma50    = closes.slice(-50).reduce((a, b) => a + b, 0) / 50;
  const spyClose = closes[closes.length - 1];
  return { bullish: spyClose > sma50, spyClose: round(spyClose), sma50: round(sma50) };
}

// Screen a single ticker: apply all filters, return setup object or null
async function analyzeTicker(ticker) {
  const since = new Date();
  since.setMonth(since.getMonth() - 6);

  const chart = await yahooFinance.chart(ticker, { period1: since, interval: '1d' });
  if (!chart?.quotes?.length) return null;

  const quotes = chart.quotes.filter(
    q => q.close != null && q.high != null && q.low != null && q.volume != null
  );

  if (quotes.length < Math.max(ROC_PERIOD, RSI_PERIOD, EMA_PERIOD, ATR_PERIOD) + 5) return null;

  const closes  = quotes.map(q => q.close);
  const highs   = quotes.map(q => q.high);
  const lows    = quotes.map(q => q.low);
  const volumes = quotes.map(q => q.volume);

  const price  = closes[closes.length - 1];
  const avgVol = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;

  // Filter: average volume > 1M shares
  if (avgVol < MIN_VOLUME) return null;
  // Filter: price between $5 and $150
  if (price < MIN_PRICE || price > MAX_PRICE) return null;
  // TODO: skip tickers with earnings within 5 trading days

  // Filter: 4-week ROC positive
  if (closes.length <= ROC_PERIOD) return null;
  const roc = (price - closes[closes.length - ROC_PERIOD - 1]) / closes[closes.length - ROC_PERIOD - 1] * 100;
  if (roc <= 0) return null;

  // Filter: RSI(14) between 40 and 65
  const rsiArr = RSI.calculate({ values: closes, period: RSI_PERIOD });
  const rsi    = rsiArr[rsiArr.length - 1];
  if (rsi == null || rsi < RSI_LOW || rsi > RSI_HIGH) return null;

  // Filter: close within 2% of 21-day EMA
  const emaArr  = EMA.calculate({ values: closes, period: EMA_PERIOD });
  const ema     = emaArr[emaArr.length - 1];
  if (ema == null) return null;
  const emaDist = (price - ema) / ema * 100;
  if (Math.abs(emaDist) > EMA_BAND_PCT) return null;

  // Calculations: ATR, stop, position size, target
  const atrArr = ATR.calculate({ high: highs, low: lows, close: closes, period: ATR_PERIOD });
  const atr    = atrArr[atrArr.length - 1];
  if (atr == null || atr <= 0) return null;

  const stopLoss     = price - ATR_STOP_MULT * atr;
  const riskPerShare = price - stopLoss;
  if (riskPerShare <= 0) return null;

  const shares     = Math.floor((PORTFOLIO_SIZE * RISK_PCT) / riskPerShare);
  const target     = price + RR_RATIO * riskPerShare;
  const riskDollars = shares * riskPerShare;
  const last10     = closes.slice(-10).map(c => round(c));

  return {
    ticker,
    price:          round(price),
    roc_pct:        round(roc),
    rsi:            round(rsi, 1),
    ema:            round(ema),
    ema_dist_pct:   round(emaDist),
    atr:            round(atr),
    stop_loss:      round(stopLoss),
    target:         round(target),
    shares,
    risk_dollars:   round(riskDollars),
    last_10_closes: last10,
  };
}

// Generate a Claude brief for one setup
// System prompt is cached after the first call — calls 2-10 hit cache at ~10% of normal input cost
async function generateBrief(client, setup) {
  const sign = v => (v >= 0 ? '+' : '') + v;
  const msg = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 300,
    output_config: { effort: 'medium' },
    system: [{ type: 'text', text: BRIEF_SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{
      role: 'user',
      content:
        `Ticker: ${setup.ticker}\n` +
        `Entry: $${setup.price} | Stop: $${setup.stop_loss} | Target: $${setup.target} | Shares: ${setup.shares} | Risk: $${setup.risk_dollars}\n` +
        `4-Week ROC: ${sign(setup.roc_pct)}% | RSI(14): ${setup.rsi} | 21-day EMA: $${setup.ema} (${sign(setup.ema_dist_pct)}%) | ATR(14): $${setup.atr}\n` +
        `Last 10 closes: ${JSON.stringify(setup.last_10_closes)}`,
    }],
  });
  return msg.content[0].text.trim();
}

// Main screener job (runs async, updates in-memory job state and DB when done)
async function runScreener() {
  try {
    // 1. Universe
    job.phase = 'Fetching S&P 500 tickers...';
    const tickers = await fetchSP500Tickers();
    job.total = tickers.length;

    // 2. Regime check
    job.phase = 'Checking market regime (SPY vs 50-day SMA)...';
    const regime = await checkRegime();

    if (!regime.bullish) {
      db.prepare(`
        UPDATE screener_results SET run_date=?, status='done', regime_bullish=0,
          spy_close=?, sma50=?, setups='[]',
          message='SPY is below its 50-day SMA. No setups generated.',
          updated_at=datetime('now') WHERE id=1
      `).run(new Date().toISOString().slice(0, 10), regime.spyClose, regime.sma50);
      job = { running: false, progress: 0, total: 500, phase: 'done', error: null };
      return;
    }

    // 3. Screen with 20 concurrent requests per batch
    job.phase = 'Screening tickers...';
    const setups = [];
    for (let i = 0; i < tickers.length; i += CONCURRENCY) {
      const batch   = tickers.slice(i, i + CONCURRENCY);
      const results = await Promise.all(batch.map(t => analyzeTicker(t).catch(() => null)));
      setups.push(...results.filter(Boolean));
      job.progress = Math.min(i + CONCURRENCY, tickers.length);
    }

    if (!setups.length) {
      db.prepare(`
        UPDATE screener_results SET run_date=?, status='done', regime_bullish=1,
          spy_close=?, sma50=?, setups='[]',
          message='No stocks passed all filters this week.',
          updated_at=datetime('now') WHERE id=1
      `).run(new Date().toISOString().slice(0, 10), regime.spyClose, regime.sma50);
      job = { running: false, progress: 0, total: 500, phase: 'done', error: null };
      return;
    }

    // 4. Rank by 4-week ROC, keep top N
    setups.sort((a, b) => b.roc_pct - a.roc_pct);
    const top = setups.slice(0, TOP_N);

    // 5. Claude briefs (prompt cached, calls 2-10 at ~10% input cost)
    job.phase = 'Generating Claude trade briefs...';
    const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
    for (const setup of top) {
      try {
        setup.brief = await generateBrief(client, setup);
      } catch (e) {
        setup.brief = 'Analysis unavailable.';
        console.error(`[screener] Claude error for ${setup.ticker}:`, e.message);
      }
    }

    // 6. Persist results
    db.prepare(`
      UPDATE screener_results SET run_date=?, status='done', regime_bullish=1,
        spy_close=?, sma50=?, setups=?,
        message=?, updated_at=datetime('now') WHERE id=1
    `).run(
      new Date().toISOString().slice(0, 10),
      regime.spyClose,
      regime.sma50,
      JSON.stringify(top),
      `${top.length} setups from ${setups.length} that passed filters.`
    );

    job = { running: false, progress: tickers.length, total: tickers.length, phase: 'done', error: null };

  } catch (e) {
    console.error('[screener] fatal error:', e);
    job = { running: false, progress: 0, total: 500, phase: 'error', error: e.message };
  }
}

// ── Middleware: admin only ─────────────────────────────────────────────────────
const requireAdmin = [
  requireAuth,
  (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    next();
  },
];

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/screener/status — current job progress (for frontend polling)
router.get('/status', requireAdmin, (req, res) => {
  res.json(job);
});

// GET /api/screener/debug — test each step individually without running the full screener
router.get('/debug', requireAdmin, async (req, res) => {
  const out = {};
  try {
    const tickers = await fetchSP500Tickers();
    out.tickers = { ok: true, count: tickers.length, sample: tickers.slice(0, 5) };
  } catch (e) { out.tickers = { ok: false, error: e.message }; }

  try {
    const regime = await checkRegime();
    out.regime = { ok: true, ...regime };
  } catch (e) { out.regime = { ok: false, error: e.message }; }

  try {
    const sample = await analyzeTicker('AAPL');
    out.sampleTicker = { ok: true, result: sample };
  } catch (e) { out.sampleTicker = { ok: false, error: e.message }; }

  res.json(out);
});

// GET /api/screener/results — latest saved screener run
router.get('/results', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM screener_results WHERE id = 1').get();
  if (!row || !row.run_date) return res.json(null);
  res.json({
    ...row,
    setups:          JSON.parse(row.setups || '[]'),
    regime_bullish:  row.regime_bullish === 1,
  });
});

// POST /api/screener/run — start a new screener job (async, returns 202 immediately)
router.post('/run', requireAdmin, (req, res) => {
  if (job.running) return res.status(409).json({ error: 'A screener job is already running.' });
  job = { running: true, progress: 0, total: 500, phase: 'Starting...', error: null };
  runScreener();
  res.status(202).json({ ok: true });
});

module.exports = router;
