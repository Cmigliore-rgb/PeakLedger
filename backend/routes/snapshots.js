const express = require('express');
const router = express.Router();
const db = require('../db');
const requireAuth = require('../middleware/requireAuth');

// Record today's net worth snapshot (upsert — one per user per day)
router.post('/', requireAuth, (req, res) => {
  const { netWorth } = req.body;
  if (typeof netWorth !== 'number') return res.status(400).json({ error: 'netWorth required' });

  const today = new Date().toISOString().slice(0, 10);
  db.prepare(`
    INSERT INTO net_worth_snapshots (user_id, date, value)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET value = excluded.value
  `).run(req.user.id, today, netWorth);

  res.json({ ok: true });
});

// Get last 90 days of snapshots for the authenticated user
router.get('/', requireAuth, (req, res) => {
  const snapshots = db.prepare(`
    SELECT date, value FROM (
      SELECT date, value FROM net_worth_snapshots
      WHERE user_id = ?
      ORDER BY date DESC
      LIMIT 90
    ) ORDER BY date ASC
  `).all(req.user.id);
  res.json({ snapshots });
});

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Manually correct a single day's recorded net worth (e.g. a bad value left behind
// by a data-entry mistake that's since been fixed, but the historical point is frozen)
router.put('/:date', requireAuth, (req, res) => {
  const { date } = req.params;
  const { netWorth } = req.body;
  if (!DATE_RE.test(date)) return res.status(400).json({ error: 'invalid date' });
  if (typeof netWorth !== 'number') return res.status(400).json({ error: 'netWorth required' });

  db.prepare(`
    INSERT INTO net_worth_snapshots (user_id, date, value)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET value = excluded.value
  `).run(req.user.id, date, netWorth);

  res.json({ ok: true });
});

// Remove a single day's snapshot entirely (e.g. an outlier point)
router.delete('/:date', requireAuth, (req, res) => {
  const { date } = req.params;
  if (!DATE_RE.test(date)) return res.status(400).json({ error: 'invalid date' });

  db.prepare('DELETE FROM net_worth_snapshots WHERE user_id = ? AND date = ?').run(req.user.id, date);
  res.json({ ok: true });
});

module.exports = router;
