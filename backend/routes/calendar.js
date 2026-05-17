const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const requireAuth = require('../middleware/requireAuth');
const db = require('../db');

const APP_URL = process.env.APP_URL || process.env.FRONTEND_URL || 'https://peakledger.app';
const REDIRECT_URI = `${APP_URL}/api/calendar/google/callback`;
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

function makeOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
}

// GET /api/calendar/google/auth — returns the Google OAuth URL
router.get('/google/auth', requireAuth, (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ error: 'Google Calendar not configured' });
  }
  const oauth2 = makeOAuth2Client();
  const url = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state: String(req.user.id),
  });
  res.json({ url });
});

// GET /api/calendar/google/callback — Google redirects here after consent
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) return res.redirect(`${APP_URL}/?cal_error=missing_params`);
  try {
    const oauth2 = makeOAuth2Client();
    const { tokens } = await oauth2.getToken(code);
    if (!tokens.refresh_token) return res.redirect(`${APP_URL}/?cal_error=no_refresh_token`);
    db.prepare('UPDATE users SET google_calendar_refresh_token = ?, google_calendar_connected_at = datetime(\'now\') WHERE id = ?')
      .run(tokens.refresh_token, parseInt(state));
    res.redirect(`${APP_URL}/?cal_connected=1`);
  } catch (err) {
    console.error('Calendar callback error:', err.message);
    res.redirect(`${APP_URL}/?cal_error=auth_failed`);
  }
});

// GET /api/calendar/google/sync — fetch upcoming events from Google Calendar
router.get('/google/sync', requireAuth, async (req, res) => {
  const user = db.prepare('SELECT google_calendar_refresh_token FROM users WHERE id = ?').get(req.user.id);
  if (!user?.google_calendar_refresh_token) return res.status(404).json({ error: 'Not connected' });
  try {
    const oauth2 = makeOAuth2Client();
    oauth2.setCredentials({ refresh_token: user.google_calendar_refresh_token });
    const calendar = google.calendar({ version: 'v3', auth: oauth2 });
    const now = new Date();
    const sixMonthsOut = new Date(now.getFullYear(), now.getMonth() + 6, 1);
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString(),
      timeMax: sixMonthsOut.toISOString(),
      maxResults: 200,
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = (response.data.items || []).map(ev => {
      const start = ev.start?.date || ev.start?.dateTime?.slice(0, 10);
      return { id: `gcal_${ev.id}`, title: ev.summary || 'Untitled', date: start, type: 'reminder', note: '', _imported: true, _gcal: true };
    }).filter(ev => ev.date);
    res.json({ events });
  } catch (err) {
    console.error('Calendar sync error:', err.message);
    if (err.code === 401 || err.status === 401) {
      db.prepare('UPDATE users SET google_calendar_refresh_token = NULL, google_calendar_connected_at = NULL WHERE id = ?').run(req.user.id);
      return res.status(401).json({ error: 'Token expired. Please reconnect.' });
    }
    res.status(500).json({ error: 'Sync failed' });
  }
});

// GET /api/calendar/google/status — check if connected
router.get('/google/status', requireAuth, (req, res) => {
  const user = db.prepare('SELECT google_calendar_refresh_token, google_calendar_connected_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ connected: !!user?.google_calendar_refresh_token, connectedAt: user?.google_calendar_connected_at || null });
});

// DELETE /api/calendar/google/disconnect
router.delete('/google/disconnect', requireAuth, (req, res) => {
  db.prepare('UPDATE users SET google_calendar_refresh_token = NULL, google_calendar_connected_at = NULL WHERE id = ?').run(req.user.id);
  res.json({ ok: true });
});

module.exports = router;
