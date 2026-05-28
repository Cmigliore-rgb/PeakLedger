#!/usr/bin/env node
/**
 * PeakLedger Trade Tracker
 * Usage:
 *   node tracker.js --log      Record a completed trade
 *   node tracker.js --report   Generate performance report with Claude analysis
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const fs       = require('fs');
const path     = require('path');
const readline = require('readline');
const Anthropic = require('@anthropic-ai/sdk');

const LOG_FILE    = path.join(__dirname, 'trade_log.json');
const REPORT_DIR  = __dirname;

// ── Utilities ─────────────────────────────────────────────────────────────────
function loadLog() {
  if (!fs.existsSync(LOG_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')); } catch { return []; }
}

function saveLog(trades) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(trades, null, 2));
}

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function pct(n) { return (n * 100).toFixed(1) + '%'; }
function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

// ── --log: Record a completed trade ──────────────────────────────────────────
async function logTrade() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('\n── Record Completed Trade ──────────────────────────────\n');

  const ticker     = (await ask(rl, 'Ticker:                    ')).trim().toUpperCase();
  const entryDate  = (await ask(rl, 'Entry date (YYYY-MM-DD):   ')).trim();
  const entryPrice = parseFloat(await ask(rl, 'Entry price ($):           '));
  const exitDate   = (await ask(rl, 'Exit date  (YYYY-MM-DD):   ')).trim();
  const exitPrice  = parseFloat(await ask(rl, 'Exit price ($):            '));

  console.log('Outcome options: win | loss | time_stop');
  const outcome    = (await ask(rl, 'Outcome:                   ')).trim().toLowerCase();

  console.log('Signal options: STRONG | BORDERLINE | SKIP');
  const signal     = (await ask(rl, 'Signal rating at entry:    ')).trim().toUpperCase();

  rl.close();

  const returnPct  = ((exitPrice - entryPrice) / entryPrice) * 100;
  const trade = { ticker, entryDate, entryPrice, exitDate, exitPrice, outcome, signal, returnPct: Math.round(returnPct * 100) / 100, loggedAt: new Date().toISOString() };

  const trades = loadLog();
  trades.push(trade);
  saveLog(trades);

  console.log(`\n✓ Logged: ${ticker} ${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}% (${outcome})`);
  console.log(`  Total trades logged: ${trades.length}\n`);
}

// ── --report: Generate performance report ─────────────────────────────────────
async function generateReport() {
  const trades = loadLog();

  if (!trades.length) {
    console.log('\nNo trades logged yet. Use --log to record your first trade.\n');
    return;
  }

  // ── Core stats ────────────────────────────────────────────────────────────
  const wins   = trades.filter(t => t.outcome === 'win');
  const losses = trades.filter(t => t.outcome === 'loss');
  const total  = trades.length;
  const winRate = wins.length / total;

  const bySignal = ['STRONG', 'BORDERLINE', 'SKIP'].map(sig => {
    const group  = trades.filter(t => t.signal === sig);
    const gWins  = group.filter(t => t.outcome === 'win');
    return {
      signal:  sig,
      count:   group.length,
      winRate: group.length ? gWins.length / group.length : null,
      avgReturn: group.length ? avg(group.map(t => t.returnPct)) : null,
    };
  });

  const avgWin  = avg(wins.map(t => t.returnPct));
  const avgLoss = avg(losses.map(t => t.returnPct));

  // ── Build report text ─────────────────────────────────────────────────────
  const lines = [
    `PEAKLEDGER PERFORMANCE REPORT — ${new Date().toISOString().slice(0, 10)}`,
    '='.repeat(56),
    '',
    `Total trades logged: ${total}`,
    `Overall win rate:    ${pct(winRate)} (${wins.length}W / ${losses.length}L)`,
    `Avg winning return:  ${avgWin >= 0 ? '+' : ''}${avgWin.toFixed(2)}%`,
    `Avg losing return:   ${avgLoss.toFixed(2)}%`,
    '',
    'Win Rate by Signal',
    '─'.repeat(40),
    ...bySignal.map(s =>
      s.count
        ? `  ${s.signal.padEnd(12)} ${s.count} trades   WR: ${pct(s.winRate)}   Avg: ${s.avgReturn >= 0 ? '+' : ''}${s.avgReturn.toFixed(2)}%`
        : `  ${s.signal.padEnd(12)} no trades yet`
    ),
    '',
  ];

  const statsBlock = lines.join('\n');
  console.log('\n' + statsBlock);

  // ── Claude analysis ───────────────────────────────────────────────────────
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.log('(CLAUDE_API_KEY not set — skipping Claude analysis)\n');
    saveReportFile(statsBlock + '\n[Claude analysis skipped — no API key]\n');
    return;
  }

  console.log('Generating Claude analysis...\n');
  const client = new Anthropic({ apiKey });

  const prompt =
    `Here is my swing trade performance data:\n\n${statsBlock}\n\n` +
    `Full trade log (JSON):\n${JSON.stringify(trades, null, 2)}\n\n` +
    `Write a 4-5 sentence plain English analysis covering: ` +
    `(1) what the data suggests about which signal ratings are actually working, ` +
    `(2) whether any of the 5 scoring criteria (ROC>8%, RSI 45-60, EMA within 1%, ATR<3%, volume>3M) ` +
    `appear to be weak predictors worth removing based on win/loss patterns, ` +
    `(3) what to focus on in the next month of trading. Be direct and honest.`;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  });

  const analysis = msg.content[0].text.trim();
  const separator = '\nClaude Analysis\n' + '─'.repeat(40) + '\n';
  console.log(separator + analysis + '\n');

  saveReportFile(statsBlock + separator + analysis + '\n');
}

function saveReportFile(content) {
  const date = new Date().toISOString().slice(0, 10);
  const fname = path.join(REPORT_DIR, `performance_report_${date}.txt`);
  fs.writeFileSync(fname, content);
  console.log(`Report saved: ${fname}\n`);
}

// ── Entry point ───────────────────────────────────────────────────────────────
const flag = process.argv[2];
if (flag === '--log') {
  logTrade().catch(e => { console.error(e.message); process.exit(1); });
} else if (flag === '--report') {
  generateReport().catch(e => { console.error(e.message); process.exit(1); });
} else {
  console.log('\nUsage:\n  node tracker.js --log      Record a completed trade\n  node tracker.js --report   Generate performance report\n');
}
