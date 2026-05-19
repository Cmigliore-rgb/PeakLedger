const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const db = require('../db');

router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT transaction_id, category FROM txn_category_overrides WHERE user_id = ?').all(req.user.id);
  const overrides = Object.fromEntries(rows.map(r => [r.transaction_id, r.category]));
  res.json({ overrides });
});

router.put('/', requireAuth, (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') return res.status(400).json({ error: 'body must be an object' });
  const upsert = db.prepare(`
    INSERT INTO txn_category_overrides (user_id, transaction_id, category) VALUES (?, ?, ?)
    ON CONFLICT(user_id, transaction_id) DO UPDATE SET category = excluded.category
  `);
  const remove = db.prepare('DELETE FROM txn_category_overrides WHERE user_id = ? AND transaction_id = ?');
  const doAll = db.transaction(entries => {
    entries.forEach(([txnId, cat]) => {
      if (cat) upsert.run(req.user.id, txnId, cat);
      else remove.run(req.user.id, txnId);
    });
  });
  doAll(Object.entries(updates));
  res.json({ ok: true });
});

module.exports = router;
