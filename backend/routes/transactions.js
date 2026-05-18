const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const { getTransactions } = require('../data_controller');

router.get('/', requireAuth, async (req, res) => {
  try {
    const end   = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    const start = startDate.toISOString().split('T')[0];
    res.json(await getTransactions(req, start, end));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/budget', requireAuth, async (req, res) => {
  try {
    const now   = new Date();
    const end   = now.toISOString().split('T')[0];
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const { transactions } = await getTransactions(req, start, end);
    const byCategory = {};
    transactions
      .filter(t => {
        if (t.amount <= 0) return false;
        const primary = (t.personal_finance_category?.primary || t.category?.[0] || '').toUpperCase();
        if (primary === 'TRANSFER_IN' || primary === 'TRANSFER_OUT') return false;
        const name = (t.merchant_name || t.name || '').toLowerCase();
        if (/^(transfer (from|to|between)|online transfer|account transfer|zelle transfer)/i.test(name)) return false;
        return true;
      })
      .forEach(t => {
        const cat = t.personal_finance_category?.primary || t.category?.[0] || 'Other';
        byCategory[cat] = (byCategory[cat] || 0) + t.amount;
      });

    const budget = Object.entries(byCategory)
      .map(([category, total]) => ({ category, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total);

    res.json({ budget });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
