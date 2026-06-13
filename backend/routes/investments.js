const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const { getHoldings } = require('../data_controller');
const db = require('../db');

router.get('/holdings', requireAuth, async (req, res) => {
  try {
    const result = await getHoldings(req);
    // Apply any price overrides (e.g. to fix incorrect Plaid-reported prices)
    const overrides = db.prepare('SELECT security_id, price FROM holding_price_overrides WHERE user_id = ?').all(req.user.id);
    if (overrides.length && result.holdings?.length) {
      const overrideMap = Object.fromEntries(overrides.map(o => [o.security_id, o.price]));
      result.holdings = result.holdings.map(h =>
        overrideMap[h.security_id] != null
          ? { ...h, institution_price: overrideMap[h.security_id], _price_overridden: true }
          : h
      );
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set or clear a price override for a specific holding (by security_id)
router.put('/price-override/:security_id', requireAuth, (req, res) => {
  const { price } = req.body;
  const { security_id } = req.params;
  if (price == null) {
    db.prepare('DELETE FROM holding_price_overrides WHERE user_id = ? AND security_id = ?').run(req.user.id, security_id);
    return res.json({ ok: true, cleared: true });
  }
  db.prepare(`
    INSERT INTO holding_price_overrides (user_id, security_id, price) VALUES (?, ?, ?)
    ON CONFLICT(user_id, security_id) DO UPDATE SET price = excluded.price
  `).run(req.user.id, security_id, Number(price));
  res.json({ ok: true });
});

module.exports = router;
