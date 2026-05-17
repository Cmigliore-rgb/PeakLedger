const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const db = require('../db');

router.get('/limits', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT category, amount FROM budget_limits WHERE user_id = ?').all(req.user.id);
  const limits = Object.fromEntries(rows.map(r => [r.category, r.amount]));
  res.json({ limits });
});

router.post('/limits', requireAuth, (req, res) => {
  const { category, limit } = req.body;
  if (!category) return res.status(400).json({ error: 'category required' });

  if (limit === null || limit === undefined || limit === '') {
    db.prepare('DELETE FROM budget_limits WHERE user_id = ? AND category = ?').run(req.user.id, category);
  } else {
    db.prepare(`
      INSERT INTO budget_limits (user_id, category, amount) VALUES (?, ?, ?)
      ON CONFLICT(user_id, category) DO UPDATE SET amount = excluded.amount
    `).run(req.user.id, category, parseFloat(limit));
  }

  const rows = db.prepare('SELECT category, amount FROM budget_limits WHERE user_id = ?').all(req.user.id);
  res.json({ limits: Object.fromEntries(rows.map(r => [r.category, r.amount])) });
});

router.put('/limits', requireAuth, (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') return res.status(400).json({ error: 'body must be an object' });
  const upsert = db.prepare(`
    INSERT INTO budget_limits (user_id, category, amount) VALUES (?, ?, ?)
    ON CONFLICT(user_id, category) DO UPDATE SET amount = excluded.amount
  `);
  const doAll = db.transaction(entries => {
    entries.forEach(([cat, amt]) => upsert.run(req.user.id, cat, parseFloat(amt)));
  });
  doAll(Object.entries(updates).filter(([, v]) => parseFloat(v) > 0));
  const rows = db.prepare('SELECT category, amount FROM budget_limits WHERE user_id = ?').all(req.user.id);
  res.json({ limits: Object.fromEntries(rows.map(r => [r.category, r.amount])) });
});

module.exports = router;
